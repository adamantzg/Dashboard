using System;
using System.Collections.Generic;
using System.Text;

namespace AdminToolsLib
{
    public class AgentDescriptor : IAgentDescriptor
    {
		public string AgentName { get; set; }
		public string AgentRole { get; set; }
		public string ClientName { get; set; }
		public DateTime? DateCreated { get; set; }
		public DateTime? ExpirationDate { get; set; }
		public string Id { get; set; }
		public string LocalIp { get; set; }
		public int LocalPort { get; set; }
		public string MachineName { get; set; }
		public string PublicIp { get; set; }
		public int RemotePort { get; set; }
		public string SshServer { get; set; }
		public DateTime? LastActive { get; set; }
		public int? IdSSHServer { get; set; }
	}
}
