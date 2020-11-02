using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace AdminWebApp.Models
{
    public class UnitOfWork : IUnitOfWork
    {
	    private MyContext context;

	    public UnitOfWork(MyContext context)
	    {
		    this.context = context;
	    }

	    public void Save()
	    {
		    context.SaveChanges();
	    }

	    public IGenericRepository<User> UserRepository => new GenericRepository<User>(context);
		public IGenericRepository<Dashboard> DashboardRepository => new DashboardRepository(context);
		public IGenericRepository<WidgetType> WidgetTypeRepository => new GenericRepository<WidgetType>(context);
		public IGenericRepository<Widget> WidgetRepository => new GenericRepository<Widget>(context);
	}
}
