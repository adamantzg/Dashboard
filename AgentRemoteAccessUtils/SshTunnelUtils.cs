using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;
using System.Diagnostics;
using System.IO;
using System.Threading;
using NLog;

namespace AgentRemoteAccessUtils
{
    public class SshTunnelUtils
    {
        public SshTunnelUtils(Logger log)
        {
            Log = log;
        }

        protected readonly Logger Log = LogManager.GetCurrentClassLogger();
        public AgentDescriptor RegisterTunnel(int sshServicePort, AgentDescriptor descriptor)
        {
            MiscUtils.CheckServiceRunning(sshServicePort);

            using (var client = new WebClient())
            {
                try
                {
                    Log.Info("Calling SSHService to register tunnel");
                    return JsonConvert.DeserializeObject<AgentDescriptor>(
                        client.UploadString(string.Format("http://localhost:{0}?cmd=registeragent",
                        sshServicePort.ToString()), "POST", JsonConvert.SerializeObject(descriptor)));
                    
                }
                catch (WebException ex)
                {
                    Log.Error("SshTunnelUtils - RegisterTunnel WebException error: {0}", ex);
                }
                catch (Exception ex)
                {
                    Log.Error("SshTunnelUtils - RegisterTunnel general error: {0}", ex);
                }
                return null;
            }
        }

        public AgentDescriptor ReOpenTunnel(int sshServicePort, AgentDescriptor descriptor)
        {
            MiscUtils.CheckServiceRunning(sshServicePort);

            using (var client = new WebClient())
            {
                try
                {
                    return JsonConvert.DeserializeObject<AgentDescriptor>(
                        client.UploadString(string.Format("http://localhost:{0}?cmd=reopentunnel",
                        sshServicePort.ToString()), "POST", JsonConvert.SerializeObject(descriptor)));
                }
                catch (WebException ex)
                {
                    Log.Error(ex);
                }
                return null;
            }
        }

        

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        
    }
}
