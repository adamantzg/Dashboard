using AdminToolsLib;
using Microsoft.EntityFrameworkCore;
using RegistrationWebApp.Db;

namespace RegistrationWebApp
{
    public interface IMyDbContext
    {
        DbSet<AgentDescriptor> Descriptors { get; set; }
        DbSet<SSHServer> Servers { get; set; }
    }
}