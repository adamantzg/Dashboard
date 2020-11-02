using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp
{
    public class AppSettings
    {
        public string Secret { get; set; }
        public string AgentDescriptorsApiUrl { get; set; }
        public string AgentDescriptorsApiKey { get; set; }
    }    
}
