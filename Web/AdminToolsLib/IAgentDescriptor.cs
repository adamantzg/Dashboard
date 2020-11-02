using System;

namespace AdminToolsLib
{
	public interface IAgentDescriptor
	{
		string AgentName { get; set; }
		string AgentRole { get; set; }
		string ClientName { get; set; }
		DateTime? DateCreated { get; set; }
		DateTime? ExpirationDate { get; set; }
		string Id { get; set; }
		string LocalIp { get; set; }
		int LocalPort { get; set; }
		string MachineName { get; set; }
		string PublicIp { get; set; }
		int RemotePort { get; set; }
		string SshServer { get; set; }				
		int? IdSSHServer { get; set; }
	}

	
}
