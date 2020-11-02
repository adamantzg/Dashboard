using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using NLog;
using Newtonsoft.Json;

namespace AgentRemoteAccessUtils
{
    public class PortUtils : IDisposable
    {
        public static Logger Log = LogManager.GetCurrentClassLogger();
        private const int timeout = 10;

        public int GetNextFreeLocalPort(AgentDescriptor descriptor,int sshServicePort)
        {
            MiscUtils.CheckServiceRunning(sshServicePort);
            using (var client = new ExtendedWebClient(timeout))
            {
                try
                {
                    return int.Parse(client.UploadString(string.Format("http://localhost:{0}/?cmd=getnextlocalport", 
                        sshServicePort.ToString()), JsonConvert.SerializeObject(descriptor)));
                }
                catch (WebException ex)
                {
                    Log.Error("PortUtils.GetNextFreeLocalPort WebException: {0}", ex.Message);
                }
                return 0;
            }
        }

        public bool CheckLocalPortInUse(string descriptorId, int sshServicePort, int port)
        {
            MiscUtils.CheckServiceRunning(sshServicePort);
            using (var client = new ExtendedWebClient(timeout))
            {
                try
                {
                    return bool.Parse(client.DownloadString(string.Format("http://localhost:{0}/?cmd=checklocalportinuse&port={1}&descriptorId={2}",
                        sshServicePort.ToString(),port,descriptorId)));
                }
                catch (WebException ex)
                {
                    Log.Error("PortUtils.CheckLocalPortInUse Port: {0} WebException: {1}", port, ex.Message);
                }
                return false;
            }
        }

        

        public static void ReadPortRange(string range, ref int from, ref int to)
        {          
            var portRange = range.Split('-');
            if (portRange.Length > 0)
                from = int.Parse(portRange[0]);
            if (portRange.Length > 1)
                to = int.Parse(portRange[1]);            
        }

        #region IDisposable Members

        public void Dispose()
        {
            
        }

        #endregion
    }
}
