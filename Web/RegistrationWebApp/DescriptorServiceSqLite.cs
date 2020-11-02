using AdminToolsLib;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PrimS.Telnet;
using RegistrationWebApp.Db;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace RegistrationWebApp
{
    public class DescriptorServiceSqLite : IDescriptorsService
    {
        private readonly ILogger<DescriptorsService> logger;
        private readonly IConfiguration configuration;
        private readonly DbContext dbContext;
        private TunnelsConfig tunnelsConfig;
        private DbSet<AgentDescriptor> dbSetDescriptors;
        private DbSet<SSHServer> dbSetServers;

        private static object lockObj = new object();
        
        public DescriptorServiceSqLite(ILogger<DescriptorsService> logger, IConfiguration configuration, DbContext dbContext)
        {
            this.logger = logger;
            this.configuration = configuration;
            this.dbContext = dbContext;
            this.dbSetDescriptors = dbContext.Set<AgentDescriptor>();
            this.dbSetServers = dbContext.Set<SSHServer>();
            tunnelsConfig = configuration.GetSection("Tunnels").Get<TunnelsConfig>();
            //InitDb();
        }        

        /// <summary>
        /// Returns sshserver and first available port
        /// </summary>
        /// <param name="descriptor"></param>
        /// <returns></returns>
        public void Verify(AgentDescriptor descriptor)
		{
            //check server
            GetAvailableServer(descriptor);            

            CheckPortAvailable(descriptor);

            if (string.IsNullOrEmpty(descriptor.Id))
            {
                descriptor.Id = GetDescriptorId();
            }
        }

        private void GetAvailableServer(AgentDescriptor descriptor)
        {
            if (string.IsNullOrEmpty(descriptor.SshServer) || descriptor.IdSSHServer <= 0)
            {
                //Find first pingable server with free ports
                var servers = dbSetServers.ToList();
                foreach (var server in servers)
                {
                    if (dbSetDescriptors.Count(d => d.SshServer == server.Url || d.IdSSHServer == server.Id) < (tunnelsConfig.PortTo - tunnelsConfig.PortFrom))
					{
                        //there are free ports
                        if(IsServerLive(server))
						{
                            descriptor.SshServer = server.Url;
                            descriptor.IdSSHServer = server.Id;
                            return;
						}
					}

                }
                throw new ArgumentException("No available SSH servers.");
            }
        }

		private bool IsServerLive(SSHServer server)
		{
            using (var client = new Client(server.Url, 22, new System.Threading.CancellationToken()))
            {

				try
				{
                    return client.IsConnected;
				}
				catch (WebException)
				{
                    return false;
				}
            }
            
        }

		private void CheckPortAvailable(AgentDescriptor descriptor)
		{
			var port = descriptor.RemotePort;
			if (port == 0)
				port = tunnelsConfig.PortFrom;
			var attempts = 0;
			var maxAttempts = (tunnelsConfig.PortTo - tunnelsConfig.PortFrom);
			while (attempts < maxAttempts)
			{
				var exists = dbSetDescriptors.Count(d => d.Id != descriptor.Id && d.RemotePort == port) > 0;
				logger.LogInformation(exists ? "Remote port {0} exists" : "Remote port {0} doesn't exist", descriptor.RemotePort);
				attempts++;
				if (exists)
				{
					port++;
					if (port >= tunnelsConfig.PortTo)
						port = tunnelsConfig.PortFrom;
				}
				else
					break;
			}
			if (attempts > maxAttempts)
			{
				throw new ArgumentException("No more free remote ports");
			}
			descriptor.RemotePort = port;			
		}

		public void DeleteDescriptor(string id)
        {
            var desc = dbSetDescriptors.FirstOrDefault(d => d.Id == id);
            if(desc != null)
            {
                dbSetDescriptors.Remove(desc);
                dbContext.SaveChanges();
            }
        }

        public List<AgentDescriptor> GetAllDescriptors()
        {
            logger.LogInformation("DescriptorServiceSqlLite: GetAllDescriptors");
            return dbSetDescriptors.ToList();
        }

        public AgentDescriptor RegisterOrUpdate(AgentDescriptor descriptor)
        {
            Verify(descriptor);

            var desc = dbSetDescriptors.FirstOrDefault(d => d.Id == descriptor.Id);
            if (desc == null || desc.ExpirationDate < DateTime.UtcNow)
            {
                if (desc != null)
                {
                    //Expired
                    dbSetDescriptors.Remove(desc);
                }
                desc = descriptor;
                if(string.IsNullOrEmpty(desc.Id)) 
                    desc.Id = GetDescriptorId();
                desc.DateCreated = DateTime.UtcNow;
                desc.ExpirationDate = descriptor.DateCreated.Value.AddDays(tunnelsConfig.ExpirationDays);
                dbSetDescriptors.Add(desc);
            }
            else
            {
                dbContext.Entry(desc).CurrentValues.SetValues(descriptor);
            }
            dbContext.SaveChanges();
            return desc;
        }

        public void RemoveExpired()
        {
            lock(lockObj)
            {
                //currently, only remove inactive
                var activeThreshold = DateTime.Today.AddDays(-1 * tunnelsConfig.LastActiveDaysBeforeDeletion);
                /*var toBeRemoved = dbSet.Where(d => d.ExpirationDate < DateTime.UtcNow).ToList();
                foreach (var r in toBeRemoved)
                    dbSet.Remove(r);*/
                var inactive = dbSetDescriptors.Where(d => d.LastActive != null && d.LastActive < activeThreshold).ToList();
                if (inactive.Count > 0)
                {
                    foreach (var i in inactive)
                    {
                        //if (toBeRemoved.Count(x => x.Id == i.Id) == 0)
                        dbSetDescriptors.Remove(i);
                    }
                    dbContext.SaveChanges();
                }
            }
                        
        }

        public void SaveDescriptors()
        {
            //NOt used
        }

        public void UpdateDescriptor(AgentDescriptor descriptor)
        {
            var desc = dbSetDescriptors.FirstOrDefault(d => d.Id == descriptor.Id);
            if(desc != null)
            {
                dbContext.Entry(desc).CurrentValues.SetValues(descriptor);
                dbContext.SaveChanges();
            }
        }

        private void InitDb()
        {
            lock(lockObj)
            {
                logger.LogInformation("DescriptorServiceSqlLite: InitDb");
                var descriptors = dbSetDescriptors.ToList();
                if (descriptors.Count == 0)
                {
                    //Migrate from text file
                    var registrationFile = configuration.GetValue<string>("registrationsFile");
                    if (System.IO.File.Exists(registrationFile))
                    {
                        var fileDescriptors = JsonConvert.DeserializeObject<Dictionary<string,
                            List<AgentDescriptor>>>(System.IO.File.ReadAllText(registrationFile)).SelectMany(kv => kv.Value).ToList();
                        foreach (var d in fileDescriptors)
                        {
                            dbSetDescriptors.Add(d);
                        }
                        dbContext.SaveChanges();
                    }
                }
            }
            
        }

        private string GetDescriptorId()
        {
            //Three random english letters + random number 1-10000
            var rand = new Random();
            var numOfLetters = 26;
            var numOfLettersSq = numOfLetters * numOfLetters;
            var lettersRandNum = rand.Next(0, numOfLettersSq * numOfLetters);
            var number = rand.Next(1, 10000);
            var letterCombination = string.Format("{0}{1}{2}",
                char.ConvertFromUtf32('A' + lettersRandNum / numOfLettersSq),
                char.ConvertFromUtf32('A' + ((lettersRandNum % numOfLettersSq) / numOfLetters)),
                char.ConvertFromUtf32('A' + lettersRandNum % numOfLetters));

            var id = string.Format("{0}-{1}", letterCombination, number);
            if (dbSetDescriptors.Count(d => d.Id == id) > 0)
            {
                return GetDescriptorId();
            }
            return id;
        }

        public void UpdateLastActive(AgentDescriptor descriptor)
        {
            lock(lockObj)
            {
                var desc = dbSetDescriptors.FirstOrDefault(d => d.Id == descriptor.Id);
                if(desc != null)
                {
                    desc.LastActive = descriptor.LastActive;
                    dbContext.SaveChanges();
                }
            }
        }
    }
}
