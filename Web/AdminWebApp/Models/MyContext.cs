using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace AdminWebApp.Models
{
    public class MyContext : DbContext
    {
        public MyContext(DbContextOptions options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("user");
            modelBuilder.Entity<Dashboard>().ToTable("dashboard");
            modelBuilder.Entity<DashboardTab>().ToTable("dashboardTab");
            modelBuilder.Entity<WidgetType>().ToTable("widgetType");
            modelBuilder.Entity<Widget>().ToTable("widget");

            modelBuilder.Entity<Dashboard>().HasMany(d => d.Tabs).WithOne(t => t.Dashboard).HasForeignKey(t => t.DashboardId);
            modelBuilder.Entity<DashboardTab>().HasMany(t => t.Widgets).WithOne().HasForeignKey(w => w.TabId);
            modelBuilder.Entity<Widget>().HasOne(w => w.WidgetType).WithMany().HasForeignKey(w => w.WidgetTypeId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
