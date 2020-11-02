using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;

using System.Threading;
using System.ComponentModel;
using NLog;

namespace AgentRemoteAccessUtils
{
    public class WebServer : IDisposable
    {
        private readonly HttpListener _listener = new HttpListener();
        private readonly ResponseMethod _responderMethod;
        protected static Logger Log = LogManager.GetCurrentClassLogger();
        public LoggerOptions LogOptions { get; set; }

        public delegate string ResponseMethod(HttpListenerRequest request);

        public WebServer(ICollection<string> prefixes, ResponseMethod method)
        {
            if (!HttpListener.IsSupported)
            {
                throw new NotSupportedException("Needs Windows XP SP2, Server 2003 or later.");
            }
            

            
            if (prefixes == null || prefixes.Count == 0)
            {
                throw new ArgumentException("URI prefixes are required");
            }

            if (method == null)
            {
                throw new ArgumentException("responder method required");
            }

            foreach (var s in prefixes)
            {
                _listener.Prefixes.Add(s);
            }

            _responderMethod = method;
                        
            _listener.Start();
            
            
        }

        public WebServer(ResponseMethod method, params string[] prefixes)
           : this(prefixes, method)
        {
        }

        public void Run()
        {
            ThreadPool.QueueUserWorkItem(o =>
            {
                Console.WriteLine("Webserver running...");
                try
                {
                    while (_listener.IsListening)
                    {
                        ThreadPool.QueueUserWorkItem(c =>
                        {
                            var ctx = c as HttpListenerContext;
                            try
                            {
                                if (ctx == null)
                                {
                                    return;
                                }
                                Log.Info("Webserver - request received {0}. Method: {1}", ctx.Request.Url, ctx.Request.HttpMethod);
                                ctx.Response.AppendHeader("Access-Control-Allow-Origin", "*");
                                if (ctx.Request.HttpMethod == "OPTIONS")
                                {
                                    ctx.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With,Authorization, timeout");
                                    ctx.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
                                    ctx.Response.AddHeader("Access-Control-Max-Age", "1728000");
                                }
                                var rstr = _responderMethod(ctx.Request);
                                if(LogOptions == null || LogOptions.LogResponse)
								{
                                    Log.Info("Webserver - respondermethod result: {0}", rstr);
                                }                               
                                
                                // allow cross origin resource sharing
                                
                                
                                if (ctx.Request.HttpMethod != "OPTIONS")
                                {
                                    var buf = Encoding.UTF8.GetBytes(rstr);
                                    ctx.Response.ContentLength64 = buf.Length;
                                    ctx.Response.OutputStream.Write(buf, 0, buf.Length);
                                }
                            }
                            catch(Exception ex)
                            {
                                ctx.Response.StatusCode = 500;
                                var buf = Encoding.UTF8.GetBytes(ex.Message);
                                Log.Error("Webserver response error: {0}", ex.Message);
                                ctx.Response.OutputStream.Write(buf, 0, buf.Length);
                            }
                            finally
                            {
                                // always close the stream
                                if (ctx != null)
                                {
                                    ctx.Response.OutputStream.Close();
                                }
                            }
                        }, _listener.GetContext());
                    }
                }
                catch (Exception ex)
                {
                    // ignored
                    Log.Error("WebServer.Run - {0}", ex.Message);
                }
            });
        }

        public void Stop()
        {
            _listener.Stop();
            _listener.Close();
        }

        public static void Create(WebServer.ResponseMethod method, string url, string message, Logger logger) 
        {
            Create(method, url, message, logger, true, null);
        }

        public static WebServer Create(WebServer.ResponseMethod method, string url, string message, Logger logger, bool waitForKey, LoggerOptions logOptions)
        {
            if (logger != null)
            {
                Log = logger;
            }
            
            WebServer ws;
            try
            {
                ws = new WebServer(method, url);
            }
            catch (HttpListenerException)
            {
                Log.Info("Acl exception: {0}", url);
                NetAclChecker.AddAddress(url);
                ws = new WebServer(method, url);
            }
            ws.LogOptions = logOptions;
            ws.Run();
            Console.WriteLine(message);
            Log.Info("Webserver successfully started. {0}", message);
            if(waitForKey) 
            {
                Console.ReadKey();
                ws.Stop();
            }
            return ws;
        }

        public static T GetUrlParameter<T>(HttpListenerRequest request, string paramName)
        {
            var value = (object)request.QueryString[paramName];
            if (value != null)
            {
                TypeConverter t = TypeDescriptor.GetConverter(typeof(T));
                if (value.GetType() != typeof(T))
                {
                    return (T)t.ConvertFrom(value);
                }
                return (T)value;
            }
            return default(T);
        }

        #region IDisposable Members

        public void Dispose()
        {
            
        }

        #endregion
    }

    public class LoggerOptions
	{
        public bool LogResponse { get; set; }
	}
}
