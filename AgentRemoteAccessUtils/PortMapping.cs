using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AgentRemoteAccessUtils
{
    public class PortMapping
    {
        public string Id { get; set; }
        public string AppName { get; set; }
        public string SSHServer { get; set; }
        public string ComputerName { get; set; }
        public string ClientName { get; set; }
        public int RemotePort { get; set; }
        public int LocalPort { get; set; }
    }
}
