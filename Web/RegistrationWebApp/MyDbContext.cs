using AdminToolsLib;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RegistrationWebApp.Db;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RegistrationWebApp
{
    public class MyDbContext : DbContext, IMyDbContext
    {
        private readonly IConfiguration configuration;

        public MyDbContext(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public DbSet<AgentDescriptor> Descriptors { get; set; }
		public DbSet<SSHServer> Servers { get; set; }

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite($"Filename={configuration.GetValue<string>("registrationDb")}", options =>
            {

            });
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map table names
            modelBuilder.Entity<AgentDescriptor>().ToTable("AgentDescriptor");
            modelBuilder.Entity<SSHServer>().ToTable("SSHServer");
            base.OnModelCreating(modelBuilder);
        }
    }
}
