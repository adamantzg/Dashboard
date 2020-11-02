using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Threading;
using NLog;
using System.Net;
using System.Runtime.InteropServices;

 

namespace AgentRemoteAccessUtils
{
   
    public class MiscUtils
    {
        
        private static bool serviceStartUp = false;

        public static Logger Log = LogManager.GetCurrentClassLogger();

        private static int ServiceProcessId;
        private static int ServiceTimeout = 10;

        public static AgentDescriptor LoadDescriptor(string file)
        {
            if (string.IsNullOrEmpty(file))
            {
                file = Path.Combine(Directory.GetCurrentDirectory(), "savedDescriptor.json");
            }
            if (File.Exists(file))
            {
                return JsonConvert.DeserializeObject<AgentDescriptor>(File.ReadAllText(file));
            }
            return null;
        }

        public static void SaveDescriptor(AgentDescriptor descriptor, string file)
        {
            if (string.IsNullOrEmpty(file))
            {
                file = Path.Combine(Directory.GetCurrentDirectory(), "savedDescriptor.json");
            }
            File.WriteAllText(file, JsonConvert.SerializeObject(descriptor));
        }

        public static string GetDescriptorId(IList<AgentDescriptor> descriptors)
        {
            //Three random english letters + random number 1-10000
            var rand = new Random();
            var numOfLetters = 26;
            var numOfLettersSq = numOfLetters * numOfLetters;
            var lettersRandNum = rand.Next(0, numOfLettersSq * numOfLetters);
            var number = rand.Next(1, 10000);
            var letterCombination = string.Format("{0}{1}{2}",
                char.ConvertFromUtf32('A' + lettersRandNum / numOfLettersSq),
                char.ConvertFromUtf32('A' + ((lettersRandNum % numOfLettersSq) / numOfLetters)),
                char.ConvertFromUtf32('A' + lettersRandNum % numOfLetters));

            var id = string.Format("{0}-{1}",letterCombination, number);
            if (descriptors.Count(d => d.Id == id) > 0)
            {
                return GetDescriptorId(descriptors);
            }
            return id;
        }

        public static void CheckServiceRunning(int sshServicePort)
        {
            var processes = Process.GetProcessesByName("SSHService");
            if (processes.Length == 0)
            {
                Log.Info("No SSHService task. Try to start");
                //Start process
                StartServiceProcess(sshServicePort);                
            }
            else
            {
                //Check if it accepts requests
                string message;
                if (!CheckServiceAcceptsRequests(sshServicePort, out message))
                {
                    Log.Trace("CheckServiceRunning: SSH Service not responding. Exception: {0}", message);
                    StartServiceProcess(sshServicePort);
                }
            }
        }

        private static void StartServiceProcess(int sshServicePort) 
        {
            if(ServiceProcessId > 0 || Process.GetProcessesByName("SSHService").Length > 0)            
            {
                Process oldProcess = Process.GetProcesses().FirstOrDefault(p=> (ServiceProcessId > 0 && p.Id == ServiceProcessId) || p.ProcessName == "SSHService");
                if(oldProcess != null && !oldProcess.HasExited) 
                {
                    oldProcess.Kill();
                }
            }
            ProcessStartInfo processInfo = new ProcessStartInfo
            {
                FileName = Path.Combine(Properties.Settings.Default.SSHServicePath, "SSHService.exe"),
                WorkingDirectory = Properties.Settings.Default.SSHServicePath,
                RedirectStandardOutput = false,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            Log.Info("Starting {0}", processInfo.FileName);
            Process process = Process.Start(processInfo);
            ServiceProcessId = process.Id;

            serviceStartUp = true;
            DateTime startTime = DateTime.Now;

            while (serviceStartUp)
            {
                Thread.Sleep(1000);
                string message;
                bool check = CheckServiceAcceptsRequests(sshServicePort, out message);
                if (check)
                {
                    break;
                }
                if ((DateTime.Now - startTime).TotalSeconds % 5 == 0)
                {
                    Log.Trace("CheckServiceRunning: SSH Service not responding. Exception: {0}", message);
                }
                if ((DateTime.Now - startTime).TotalSeconds > 30)
                {
                    Log.Error("SSH Service not started in 30 seconds");
                    throw new TimeoutException("SSH service not started in 30 seconds.");
                }
            }
        }

        public static bool CheckServiceAcceptsRequests(int sshServicePort, out string message) 
        {
            message = string.Empty;
            try
            {
                WebClient webClient = new ExtendedWebClient(ServiceTimeout);
                string response = webClient.DownloadString(string.Format("http://localhost:{0}/?cmd=testrunning", sshServicePort));
                if (response == "Ok")
                {
                    return true;
                }
                return false;
            }
            catch (WebException webex)
            {
                message = webex.Message;
                return false;
            }
        }

        public static void StartKeepAliveWatch(KeepAliveParameters parameters)
        {
            var thread = new Thread(new ParameterizedThreadStart(KeepAliveThreadProc));
            thread.Start(parameters);
        }

        public static void KeepAliveThreadProc(object objParams)
        {
            var parameters = objParams as KeepAliveParameters;
            Thread.Sleep(parameters.Interval * 1000); //First time, give web server chance to boot
            while (true)
            {
                CheckServiceRunning(parameters.ServicePort);
                var webClient = new ExtendedWebClient(parameters.Timeout);
                try
                {
                    var response = JsonConvert.DeserializeObject<SimpleResult>(
                        webClient.UploadString(string.Format("http://localhost:{0}/?cmd=checktunnellive", parameters.ServicePort),
                            JsonConvert.SerializeObject(parameters.Descriptor)));
                    if (!response.result.Equals(true))
                    {
                        Log.Info("Tunnel not alive. Data - Id:{0} Localport: {1}, RemotePort: {2}", parameters.Descriptor.Id, parameters.Descriptor.LocalPort, parameters.Descriptor.RemotePort);
                        Log.Info("Restarting tunnel");
                        //tunnel not alive, open it again
                        var sshUtils = new SshTunnelUtils(Log);
                        var result = sshUtils.RegisterTunnel(parameters.ServicePort, parameters.Descriptor);
                        if (result != null)
                            Log.Info("Tunnel restarted");
                        else
                            Log.Error("Tunnel down");

                    }
                }
                catch (Exception webex)
                {
                    Log.Error("KeepAlive: SSH Service web call exception. {0}", webex);
                }
                finally
                {
                    Thread.Sleep(parameters.Interval * 1000);
                }
            }
        }
       
    }

    public class KeepAliveParameters 
    {
        public AgentDescriptor Descriptor { get; set; }
        public int ServicePort { get; set; }
        public int Interval { get; set; }
        public int Timeout { get; set; }
    }

    public class SimpleResult
    {
        public object result { get; set; }
    }
}
