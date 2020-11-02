using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;


namespace AgentRemoteAccessUtils
{
    public class ExtendedWebClient : WebClient
    {
		private Int32 _timeout;
		public CookieContainer CookieContainer { get; private set; }

		public ExtendedWebClient(int timeoutSec)
		{
			_timeout = timeoutSec * 1000;
			CookieContainer = new CookieContainer();
		}

		protected override WebRequest GetWebRequest(Uri address)
		{
			var request = base.GetWebRequest(address) as HttpWebRequest;
			if (request == null) return base.GetWebRequest(address);
			request.CookieContainer = CookieContainer;
			request.SendChunked = false;
			request.Timeout = _timeout;
			return request;
		}		        

	}
}
