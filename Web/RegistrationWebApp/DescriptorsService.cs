
using AdminToolsLib;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RegistrationWebApp
{
    public interface IDescriptorsService
    {
        void SaveDescriptors();
        void RemoveExpired();
        AgentDescriptor RegisterOrUpdate(AgentDescriptor descriptor);
        List<AgentDescriptor> GetAllDescriptors();
        void Verify(AgentDescriptor descriptor);
        void UpdateDescriptor(AgentDescriptor descriptor);
        void DeleteDescriptor(string id);
        void UpdateLastActive(AgentDescriptor descriptor);
    }

    public class DescriptorsService : IDescriptorsService
    {
        private Dictionary<string, List<AgentDescriptor>> descriptors;
        private string registrationFile = "";
        const string descriptorsCacheKey = "descriptors";
        private readonly ILogger<DescriptorsService> logger;
        //private int portFrom = 8201;
        //private int portTo = 8300;
        //private int ExpirationDays = 180;
        private static readonly object lockObj = new object();
        private readonly IMemoryCache memoryCache;
        private TunnelsConfig tunnelsConfig;

        public DescriptorsService(ILogger<DescriptorsService> logger, IMemoryCache memoryCache, IConfiguration configuration)
        {
            this.logger = logger;
            this.memoryCache = memoryCache;
            registrationFile = configuration.GetValue<string>("registrationsFile");
            tunnelsConfig = configuration.GetSection("Tunnels").Get<TunnelsConfig>();
            LoadDescriptors();
        }

        public void RemoveExpired()
        {
            foreach(var k in descriptors.Keys)
            {
                var toBeRemoved = descriptors[k].Where(d => d.ExpirationDate < DateTime.UtcNow).ToList();
                foreach (var r in toBeRemoved)
                    descriptors[k].Remove(r);
            }
            SaveDescriptors();
        }

        
        private void LoadDescriptors()
        {
            var ok = false;
            lock (lockObj)
            {
                ok = memoryCache.TryGetValue(descriptorsCacheKey, out descriptors);
            }                
            if(!ok)
            {
                if (System.IO.File.Exists(registrationFile))
                {
                    descriptors = JsonConvert.DeserializeObject<Dictionary<string, List<AgentDescriptor>>>(System.IO.File.ReadAllText(registrationFile));                    
                }
                else
                    descriptors = new Dictionary<string, List<AgentDescriptor>>();
                lock(lockObj)
                {
                    memoryCache.Set(descriptorsCacheKey, descriptors);
                }                
            }            
        }

        public void SaveDescriptors()
        {
            lock(lockObj)
            {
                memoryCache.Set(descriptorsCacheKey, descriptors);
                System.IO.File.WriteAllText(registrationFile, JsonConvert.SerializeObject(descriptors));
            }            
        }

        public List<AgentDescriptor> GetAllDescriptors()
        {
            return descriptors.SelectMany(kv => kv.Value).ToList();
        }

        public AgentDescriptor RegisterOrUpdate(AgentDescriptor descriptor)
        {
            if (!descriptors.ContainsKey(descriptor.SshServer) || descriptors[descriptor.SshServer] == null)
                descriptors[descriptor.SshServer] = new List<AgentDescriptor>();
            Verify(descriptor);            

            var desc = descriptors[descriptor.SshServer].FirstOrDefault(d => d.Id == descriptor.Id);
            if (desc == null || desc.ExpirationDate < DateTime.UtcNow)
            {
                if (desc != null)
                {
                    //Expired
                    descriptors[descriptor.SshServer].Remove(desc);
                }
                desc = descriptor;
                desc.Id = GetDescriptorId(GetAllDescriptors());
                desc.DateCreated = DateTime.UtcNow;
                desc.ExpirationDate = descriptor.DateCreated.Value.AddDays(tunnelsConfig.ExpirationDays);
                descriptors[descriptor.SshServer].Add(descriptor);
            }
            else
            {
                desc.MachineName = descriptor.MachineName;
                desc.ClientName = descriptor.ClientName;
                desc.ExpirationDate = descriptor.ExpirationDate;
                desc.LocalPort = descriptor.LocalPort;
                desc.RemotePort = descriptor.RemotePort;
            }
            SaveDescriptors();
            return desc;
        }

        public void Verify(AgentDescriptor descriptor)
		{
            //check server
            if(string.IsNullOrEmpty(descriptor.SshServer))
			{
                descriptor.SshServer = GetAvailableServer(descriptor);
			}

			var port = CheckPortAvailable(descriptor);            
		}

		
		private int CheckPortAvailable(AgentDescriptor descriptor)
		{
			var port = descriptor.RemotePort;
			if (port == 0)
				port = tunnelsConfig.PortFrom;
			var attempts = 0;
			var maxAttempts = (tunnelsConfig.PortTo - tunnelsConfig.PortFrom);
			while (attempts < maxAttempts)
			{
				var exists = descriptors.ContainsKey(descriptor.SshServer) &&
				descriptors[descriptor.SshServer].Count(d => d.Id != descriptor.Id && d.RemotePort == port) > 0;
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
			if (attempts >= maxAttempts)
			{
				throw new ArgumentException("No more free remote ports");
			}
			descriptor.RemotePort = port;
			return port;
		}

        private string GetAvailableServer(AgentDescriptor descriptor)
        {
            //TODO
            return string.Empty;
        }

        public void UpdateDescriptor(AgentDescriptor descriptor)
        {
            if (descriptors.ContainsKey(descriptor.SshServer))
            {
                var found = descriptors[descriptor.SshServer].FirstOrDefault(d => d.Id == descriptor.Id);
                if (found != null)
                {
                    //Check duplicate port
                    if (descriptors[descriptor.SshServer].Count(d => d.RemotePort == descriptor.RemotePort && d.Id != descriptor.Id) > 0)
                        throw new DuplicateRemotePortException();
					CopyDescriptor(found, descriptor);
                    SaveDescriptors();                    
                }
            }
        }

        public void DeleteDescriptor(string id)
        {
            var descriptor = GetAllDescriptors().FirstOrDefault(d => d.Id == id);
            if (descriptor != null)
            {
                var index = descriptors[descriptor.SshServer].FindIndex(d => d.Id == id);
                if (index >= 0)
                {
                    descriptors[descriptor.SshServer].RemoveAt(index);
                    SaveDescriptors();
                }
            }
        }

		public string GetDescriptorId(IList<AgentDescriptor> descriptors)
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
			if (descriptors.Count(d => d.Id == id) > 0)
			{
				return GetDescriptorId(descriptors);
			}
			return id;
		}

		public void CopyDescriptor(IAgentDescriptor target, IAgentDescriptor source)
		{
			if (target != null)
			{
				target.ClientName = source.ClientName;
				target.MachineName = source.MachineName;
				target.LocalIp = source.LocalIp;
				target.PublicIp = source.PublicIp;
				target.AgentName = source.AgentName;
				target.Id = source.Id;
				target.SshServer = source.SshServer;
				target.RemotePort = source.RemotePort;
				target.LocalPort = source.LocalPort;
				target.AgentRole = source.AgentRole;
				target.DateCreated = source.DateCreated;
				target.ExpirationDate = source.ExpirationDate;
			}
		}

        public void UpdateLastActive(AgentDescriptor descriptor)
        {
            throw new NotImplementedException();
        }
    }

    public class DuplicateRemotePortException: Exception
    {

    }
}
