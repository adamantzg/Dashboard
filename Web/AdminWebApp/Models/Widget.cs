using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp.Models
{
    
    public class Widget
    {
        public int Id { get;  set; }
        public string Url { get; set; }
        public string Title { get; set; }
        public int WidgetTypeId { get; set; }
        public string Settings { get; set; }
        public int? Column { get; set; }
        public int? Index { get; set; }
        public int? TabId { get; set; } 

        public WidgetType WidgetType { get; set; }
    }

    public class WidgetType
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
