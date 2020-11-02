using AgentRemoteAccessUtils;
using CommandLine;
using NLog;
using NLog.LayoutRenderers;
using Renci.SshNet;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Eventing.Reader;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace TestSSH
{
    class Program
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();
        const string CmdSSHNet = "testsshnet";
        const string CmdPlink = "testplink";
        private static TunnelThread[] tunnels;
        private static Thread checkThread;
        private static List<TunnelInfo> tunnelInfos = new List<TunnelInfo>();
        

        static void Main(string[] args)
        {
            Parser.Default.ParseArguments<CommandLineOptions>(args)
            .WithParsed(opts => {
                if (opts.Command == CmdSSHNet)
                    OpenTunnel(opts);
                else if (opts.Command == CmdPlink)
                    OpenPlinkTunnels(opts);
                if(opts.StartServer)
				{
                    StartWebServers(opts.LocalPort, opts.NoOfTunnels);
                }
                Thread.Sleep(10000);
                StartTunnelHealthChecker();
				Console.ReadLine();
                
            })
            .WithNotParsed((errs) => {
                Log.Info("Command line argument problem");
                return;
            });
        }

		
		private static void OpenTunnel(CommandLineOptions opts)
        {
            var client = new SshClient(opts.SshServer, opts.UserName, new PrivateKeyFile(opts.KeyFile));
            client.Connect();
            client.KeepAliveInterval = new TimeSpan(0, 0, 5);

            if (!client.IsConnected)
            {
                Log.Error("Can't start tunnel, try again.");
            }

            var connectionPort = new ForwardedPortRemote(Convert.ToUInt32(opts.RemotePort), "localhost", Convert.ToUInt32(opts.LocalPort));
            client.AddForwardedPort(connectionPort);            
            connectionPort.Start();
        }

        private static void OpenPlinkTunnels(CommandLineOptions opts)
        {
            var remotePort = opts.RemotePort;
            var localPort = opts.LocalPort;

            //tunnels = new TunnelThread[opts.NoOfTunnels];
			for (int i = 1; i <= opts.NoOfTunnels; i++)
			{
                /*var data = new TunnelThreadData
                {
                    Key = opts.PlinkKey,
                    LocalPort = localPort,
                    RemotePort = remotePort,
                    SshServer = opts.SshServer,
                    UserName = opts.UserName
                };
                tunnels[i] = new TunnelThread(data);
                tunnels[i].Start();*/

                var p = StartPlink(opts.SshServer, opts.UserName, opts.PlinkKey, remotePort, localPort);
                tunnelInfos.Add(new TunnelInfo
                {
                    Key = opts.PlinkKey,
                    Process = p,
                    LocalPort = localPort,
                    RemotePort = remotePort,
                    SshServer = opts.SshServer,
                    UserName = opts.UserName
                });
                Thread.Sleep(1000);

                localPort++;
                remotePort++;
			}
        }

		private static Process StartPlink(string sshServer, string userName, string plinkKey, int remotePort, int localPort)
		{
            var p = new Process();
            var psi = p.StartInfo;
            psi.FileName = "plink.exe";
            psi.WorkingDirectory = Directory.GetCurrentDirectory();
            psi.WindowStyle = ProcessWindowStyle.Normal;
            psi.Arguments = $"{sshServer} -l {userName} -agent -batch -i {plinkKey} -N -R *:{remotePort}:localhost:{localPort}";            
            p.Start();
            return p;
        }

		private static void StartTunnelHealthChecker()
        {
            checkThread = new Thread(HealthCheckerThreadProc);
            checkThread.Start();
        }

        private static void HealthCheckerThreadProc()
		{
            while(true)
			{
                using (var client = new ExtendedWebClient(10))
                {
                    for (int i = 0; i < tunnelInfos.Count; i++)
                    {
                        var info = tunnelInfos[i];
                        try
                        {
                            var data = client.DownloadString($"http://{info.SshServer}:{info.RemotePort}");
                            info.LastSuccessCheck = DateTime.Now;
                        }
                        catch
                        {
                            Log.Info("Tunnel check failed for port {0}.", info.RemotePort);
                            if (info.LastSuccessCheck == null || (DateTime.Now - info.LastSuccessCheck.Value).TotalSeconds > 20)
                            {
                                if (info.Process != null && !info.Process.HasExited)
                                    info.Process.Kill();
                                info.Process = StartPlink(info.SshServer, info.UserName, info.Key, info.RemotePort, info.LocalPort);
                            }
                        }
                    }
                    Thread.Sleep(3000);
                }
            }            
			
		}

        private static void StartWebServers(int startPort, int noOfServers)
		{
            var port = startPort;
			for (int i = 0; i < noOfServers; i++)
			{
                StartWebServer(port++);
			}
		}

        private static void StartWebServer(int port)
        {
            var thread = new Thread(new ParameterizedThreadStart(WebServerThreadProc));
            thread.Start(port);
        }

        public static void WebServerThreadProc(object port)
        {
            WebServer.Create(SendResponse, $"http://+:{port}/", $"A service is listening on port {port}. Press any key to quit.", Log, true, new LoggerOptions { LogResponse = false });
        }

        public static string SendResponse(HttpListenerRequest request)
        {
            var cmd = GetUrlParameter<string>(request, "cmd");
            if(cmd == "getdata")
			{
                var size = GetUrlParameter<int>(request, "kb");
                if (size == 0)
                    size = 1000;
                var data = new String('X',size * 1024);
                return data;
			}
            return "Test web server running";
        }

        private static T GetUrlParameter<T>(HttpListenerRequest request, string paramName)
        {
            return WebServer.GetUrlParameter<T>(request, paramName);
        }
    }

    public class CommandLineOptions
    {
        [Option(Default ="access7.streamsink.com")]
        public string SshServer { get; set; }
        [Option(Default = "id_rsa")]
        public string KeyFile { get; set; }
        [Option(Default = "tunneler")]
        public string UserName { get; set; }
        [Option]
        public int RemotePort { get; set; }
        [Option(Default = 6454)]
        public int LocalPort { get; set; }                
        [Option(Default ="TestSSHNet")]
        public string Command { get; set; }        
        [Option(Default = "tunneler.ppk")]
        public string PlinkKey { get; set; }
        [Option]
        public bool StartServer { get; set; }
        [Option(Default = 1)]
        public int NoOfTunnels { get; set; }
    }

    public class TunnelInfo
	{
        public string SshServer { get; set; }
        public string UserName { get; set; }
        public string Key { get; set; }
        public int RemotePort { get; set; }
        public int LocalPort { get; set; }
        public Process Process { get; set; }
        public DateTime? LastSuccessCheck { get; set; }
	}

    public class TunnelThread
	{
        private Thread thread;
        private TunnelThreadData data;
        Process p;
        private static object lockObj = new object();
        private bool outputReceived = false;

        public TunnelThread(TunnelThreadData data)
        {
            this.data = data;
        }

        public Thread Thread { get { return thread; } }


        public void Start()
		{
            thread = new Thread(TunnelThreadProc);
            thread.Start();
		}

        public void Stop()
		{
            
		}

        private void TunnelThreadProc()
        {
            var p = new Process();
            var psi = p.StartInfo;            
            psi.FileName = "plink.exe";
            psi.WorkingDirectory = Directory.GetCurrentDirectory();
            psi.RedirectStandardOutput = true;
            psi.UseShellExecute = false;
            psi.Arguments = $"{data.SshServer} -l {data.UserName} -agent -batch -i {data.Key} -N -R *:{data.RemotePort}:localhost:{data.LocalPort}";
            psi.CreateNoWindow = true;
            //psi.WindowStyle = ProcessWindowStyle.Normal;
            p.OutputDataReceived += P_OutputDataReceived;
            lock (lockObj)
			{
                p.Start();
                p.BeginOutputReadLine();
                
				
                while(!outputReceived)
				{
                    Thread.Sleep(500);
				}
            }            
        }

		private void P_OutputDataReceived(object sender, DataReceivedEventArgs e)
		{
            outputReceived = true;
		}
	}

    public class TunnelThreadData
	{
        public string SshServer { get; set; }
        public string UserName { get; set; }
        public string Key { get; set; }
        public int RemotePort { get; set; }
        public int LocalPort { get; set; }
	}

    public class ExtendedWebClient : WebClient
    {
        private Int32 _timeout;
        public CookieContainer CookieContainer { get; private set; }

        public ExtendedWebClient(Int32 timeoutSec = 500)
        {
            this._timeout = timeoutSec * 1000;

            this.CookieContainer = new CookieContainer();
        }

        protected override WebRequest GetWebRequest(Uri address)
        {
            var request = base.GetWebRequest(address) as HttpWebRequest;
            if (request == null) return base.GetWebRequest(address);
            request.CookieContainer = CookieContainer;
            request.SendChunked = false;
            request.Timeout = this._timeout;
            return request;
        }
    }
}
