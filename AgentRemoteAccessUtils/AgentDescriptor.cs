using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AgentRemoteAccessUtils
{
    public class AgentDescriptor
    {
        public string ClientName { get; set; }
        public string MachineName { get; set; }
        public string LocalIp { get; set; }
        public string PublicIp { get; set; }
        public string AgentName { get; set; }
        public string Id { get; set; }
        public string SshServer { get; set; }
        public int RemotePort { get; set; }
        public int LocalPort { get; set; }
        public string AgentRole { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public int IdSSHServer { get; set; }

        public void CopyTo(AgentDescriptor target)
        {
            if(target != null)
            {
                target.ClientName = ClientName;
                target.MachineName = MachineName;
                target.LocalIp = LocalIp;
                target.PublicIp = PublicIp;
                target.AgentName = AgentName;
                target.Id = Id;
                target.SshServer = SshServer;
                target.RemotePort = RemotePort;
                target.LocalPort = LocalPort;
                target.AgentRole = AgentRole;
                target.DateCreated = DateCreated;
                target.ExpirationDate = ExpirationDate;
                target.IdSSHServer = IdSSHServer;
            }
        }
    }
}
