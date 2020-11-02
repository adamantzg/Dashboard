using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp.Models
{
	[Table("user")]
	public class User
	{
		public int? id { get; set; }
		public string email { get; set; }
		public string name { get; set; }
		public string password { get; set; }
		public string surname { get; set; }
		public string username { get; set; }
		public DateTime? created { get; set; }
		public DateTime? lastlogindate { get; set; }
		public DateTime? lastmodified { get; set; }		
		public int? verified { get; set; }
		public string token { get; set; }

		
	}
}
