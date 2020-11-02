using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RegistrationWebApp
{
    public class TunnelsConfig
    {
        public int KeepAliveTimeout { get; set; }
        public int PortFrom { get; set; }
        public int PortTo { get; set; }
        public int ExpirationDays { get; set; }
        public int LastActiveDaysBeforeDeletion { get; set; }
    }
}
