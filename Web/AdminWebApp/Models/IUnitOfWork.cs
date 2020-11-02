using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp.Models
{
    public interface IUnitOfWork
    {
        void Save();
        IGenericRepository<User> UserRepository { get; }
        IGenericRepository<Dashboard> DashboardRepository { get; }
        IGenericRepository<WidgetType> WidgetTypeRepository { get; }
        IGenericRepository<Widget> WidgetRepository { get; }
    }
}
