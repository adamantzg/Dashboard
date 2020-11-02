using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp.Models
{
    public class DashboardTab
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? OrderIndex { get; set; }
        public int? Columns { get; set; }
        public int DashboardId { get; set; }
        
        public Dashboard Dashboard { get; set; }
        public List<Widget> Widgets { get; set; }
    }
}
