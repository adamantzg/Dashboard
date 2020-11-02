using CommandLine;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using System.Runtime.CompilerServices;
using System.Configuration;
using System.Net;

namespace TestSSHClient
{
	class Program
	{
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();
        private static Random rand = new Random();

        static void Main(string[] args)
		{
            Parser.Default.ParseArguments<CommandLineOptions>(args)
           .WithParsed(opts => {
               var file = opts.InputFile;
               var testDefinitions = new List<TestDefinition>();
               var inputLines = File.ReadAllLines(file);
               var lineNo = 1;
               foreach(var line in inputLines)
			   {
                   try
				   {
                       var testDef = TestDefinition.ParseDefinition(line);
                       testDefinitions.Add(testDef);
                   }                   
                   catch(ArgumentException ex)
				   {
                       Log.Error("Illegal test definition in line {0}. {1}", lineNo, ex.Message);
				   }
                   lineNo++;
			   }
               if(testDefinitions.Count > 0)
			   {
                   RunTests(testDefinitions, opts.TestCount);
			   }

               
           })
           .WithNotParsed((errs) => {
               Log.Info("Command line argument problem");
               return;
           });
        }

		private static void RunTests(List<TestDefinition> testDefinitions, int testCount)
		{
            var i = 1;
            Log.Info("Running tests. Number of test cycles: {0}", testCount > 0 ? testCount.ToString() : "Indefinite");
			while (i<= testCount || testCount == 0)
			{
                Log.Info("Starting {0}. set of tests", i);
                var runners = new List<TestRunner>();
                foreach (var testDef in testDefinitions)
                {
                    if (testDef.PortFrom > 0)
                    {
                        for (int port = testDef.PortFrom; port <= testDef.PortTo; port++)
                        {
                            runners.Add(RunTest(testDef.Url, port, testDef.DataSizeFrom, testDef.DataSizeTo));
                        }
                    }
                    else
                    {
                        runners.Add(RunTest(testDef.Url, 0, testDef.DataSizeFrom, testDef.DataSizeTo));
                    }
                }
                var waitTime = 10 * 3600; //10 minutes tops
                Log.Info("Waiting for runners to finish");
                while (waitTime > 0 && !runners.All(r => r.Status == TestRunnerStatus.Finished))
                {
                    Thread.Sleep(5000);
                    waitTime -= 5;
                }
                i++;
            }
			
		}

		private static TestRunner RunTest(string url, int port, int dataSizeFrom, int dataSizeTo)
		{
            if(dataSizeFrom == 0 && dataSizeTo == 0)
			{
                //Not defined
                dataSizeFrom = 100;
                dataSizeTo = 100;
			}
            
            string finalUrl = port > 0 ? url.Replace("{port}", port.ToString()) : url;
            var finalSize = dataSizeFrom == dataSizeTo && dataSizeFrom > 0 ? dataSizeFrom : rand.Next(dataSizeFrom, dataSizeTo);
            finalUrl = finalUrl.Replace("{size}", finalSize.ToString());
            var runner = new TestRunner { Data = new TestRunnerData { Logger = Log, Url = finalUrl } };
            runner.OnFinished += OnRunnerFinished;
            runner.Start();
            return runner;
		}

        public static void OnRunnerFinished(TestRunner sender)
		{
            sender.Stop();
		}
	}

    
    public class CommandLineOptions
    {
        [Option]
        public string InputFile { get; set; }
        [Option(Default = 1)]
        public int TestCount { get; set; }        
    }

    public class TestDefinition
	{
        public static TestDefinition ParseDefinition(string line)
		{
            bool ok;

            if (string.IsNullOrEmpty(line))
            {
                throw new ArgumentException("Line is empty");
            }
            var result = new TestDefinition();
            var parts = line.Split(';');
            
            result.Url = parts[0];
            if (string.IsNullOrEmpty(result.Url))
            {
                throw new ArgumentException("Url definition empty");
            }
            if(parts.Length > 1)
			{
                var ports = parts[1];
                if (string.IsNullOrEmpty(ports))
                {
                    throw new ArgumentException("Ports definition empty");
                }
                var portParts = ports.Split('-');
                ok = int.TryParse(portParts[0], out int portFrom);
                if (!ok)
                {
                    throw new ArgumentException("Port value can't be parsed as number");
                }
                result.PortFrom = portFrom;
                if (portParts.Length < 2)
                {
                    result.PortTo = result.PortFrom;
                }
                else
                {
                    ok = int.TryParse(portParts[1], out int portTo);
                    if (!ok)
                    {
                        throw new ArgumentException("Port value can't be parsed as number");
                    }
                    result.PortTo = portTo;
                }
            }
            

            if (parts.Length > 2)
            {
                var dataSize = parts[2];
                if (string.IsNullOrEmpty(dataSize))
                {
                    throw new ArgumentException("Data size definition empty");
                }
                var dataSizeParts = dataSize.Split('-');
                ok = int.TryParse(dataSizeParts[0], out int dataSizeFrom);
                if (!ok)
                {
                    throw new ArgumentException("Data size value can't be parsed as number");
                }
                result.DataSizeFrom = dataSizeFrom;
                if (dataSizeParts.Length < 2)
                {
                    result.DataSizeTo = result.DataSizeFrom;
                }
                else
                {
                    ok = int.TryParse(dataSizeParts[1], out int dataSizeTo);
                    if (!ok)
                    {
                        throw new ArgumentException("Data size value can't be parsed as number");
                    }
                    result.DataSizeTo = dataSizeTo;
                }
            }
            
            return result;
        }

        public void Parse(string line)
		{
            var result = ParseDefinition(line);
            Url = result.Url;
            PortFrom = result.PortFrom;
            PortTo = result.PortTo;
            DataSizeFrom = result.DataSizeFrom;
            DataSizeTo = result.DataSizeTo;
		}

        public string Url { get; set; }
        public int PortFrom { get; set; }
        public int PortTo { get; set; }
        public int DataSizeFrom { get; set; }
        public int DataSizeTo { get; set; }
	}

    public class TestRunner
	{
        Thread thread;
        public delegate void EventHandler(TestRunner sender);
        public EventHandler OnFinished;
        public TestRunnerStatus Status { get; set; }

        public TestRunnerData Data { get; set; }

        public TestRunner()
		{
            Status = TestRunnerStatus.NotStarted;
		}

        public void Start()
		{
            thread = new Thread(ThreadProc);            
            thread.Start();
            Status = TestRunnerStatus.Running;
        }

        public void Stop()
		{
            thread.Abort();
            thread = null;
            Status = TestRunnerStatus.Finished;
		}

        private void ThreadProc()
		{
            using(var client = new ExtendedWebClient(15))
			{
				try
				{
                    client.DownloadString(Data.Url);
                    Data.Logger.Info("Success downloading from {0}", Data.Url);
                }
				catch (Exception ex)
				{
                    Data.Logger.Error("Error downloading from address: {0}. Text: {1}", Data.Url, ex.Message);
				}
                Status = TestRunnerStatus.Finished;
				OnFinished?.Invoke(this);
			}
		}
	}

    public enum TestRunnerStatus
	{
        NotStarted,
        Running, 
        Finished
	}

    public class TestRunnerData
    {
        public string Url { get; set; }
        public Logger Logger { get; set; }
        
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
