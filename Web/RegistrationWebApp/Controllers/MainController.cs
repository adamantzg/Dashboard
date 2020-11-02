using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AdminToolsLib;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace RegistrationWebApp.Controllers
{
	[ApiController]
	[Route("[controller]")]
	[Authorize]
	[ServiceFilter(typeof(DescriptorExpirationFilter))]
	public class MainController : ControllerBase
	{
			

		private readonly ILogger<MainController> _logger;
		private readonly IDescriptorsService descriptorsService;
		private readonly IConfiguration configuration;

		public MainController(ILogger<MainController> logger, IDescriptorsService descriptorsService,
			IConfiguration configuration
			)
		{
			_logger = logger;
			this.descriptorsService = descriptorsService;
			this.configuration = configuration;
		}

		
		
		/// <summary>
		/// Checks port, ssh server and assigns id if null
		/// </summary>
		/// <param name="descriptor"></param>
		/// <returns></returns>
		[HttpPost("verifydescriptor", Name = "Verify descriptor")]		
		public AgentDescriptor VerifyDescriptor([FromBody] AgentDescriptor descriptor)
		{			
			descriptorsService.Verify(descriptor);
			return descriptor;
		}

		[HttpPost("register", Name = "Register")]
		public AgentDescriptor RegisterAgent([FromBody] AgentDescriptor descriptor)
		{
			try
			{
				return RegisterOrUpdate(descriptor);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex.Message);
				throw;
			}
			
		}

		private AgentDescriptor RegisterOrUpdate(AgentDescriptor descriptor)
		{
			if (string.IsNullOrEmpty(descriptor.SshServer))
				throw new ArgumentException("SSH server name must be supplied");
			_logger.LogInformation("Registering descriptor {d}", JsonConvert.SerializeObject(descriptor));
			return descriptorsService.RegisterOrUpdate(descriptor);
		}

		[HttpGet("getdescriptor", Name = "GetDescriptor")]
		public IAgentDescriptor GetDescriptor(string id)
		{
			try
			{
				return GetAllDescriptors().FirstOrDefault(d => d.Id == id);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex.Message);
				throw;
			}			
		}

		[HttpGet("")]
		public List<AgentDescriptor> GetAllDescriptors()
		{
			_logger.LogInformation("GetAllDescriptors called");
			return descriptorsService.GetAllDescriptors();
		}

		[HttpPut("")]
		public IActionResult UpdateDescriptor([FromBody] AgentDescriptor descriptor) 
		{
			
			if (string.IsNullOrEmpty(descriptor.SshServer))
				throw new ArgumentException("SSH server must be specified");
			try
			{
				descriptorsService.UpdateDescriptor(descriptor);
			}
			catch(DuplicateRemotePortException)
			{
				return BadRequest($"Remote port {descriptor.RemotePort} already in use");
			}
			return Ok(descriptor);			
		}

		[HttpPut("updateLastActive")]
		public IActionResult UpdateLastActive([FromBody] AgentDescriptor descriptor)
		{
			descriptorsService.UpdateLastActive(descriptor);
			return Ok(descriptor);
		}

		[HttpDelete("")]
		public void DeleteDescriptor(string id)
		{
			descriptorsService.DeleteDescriptor(id);
		}

		[HttpPost("checktunnel", Name = "CheckTunnel")]
		public async Task<bool> CheckTunnelAlive([FromBody] AgentDescriptor descriptor)
		{
			try
			{
				using (var client = new HttpClient())
				{
					var url = $"http://{descriptor.SshServer}:{descriptor.RemotePort}/?cmd=status&detaillevel=ping";
					var response = await client.GetAsync(url);
					var result = JsonConvert.DeserializeObject(response.Content.ReadAsStringAsync().Result);
					if(result != null)
                    {
						descriptor.LastActive = DateTime.Now;
						descriptorsService.UpdateLastActive(descriptor);
                    }
					return result != null;
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex.Message);
				return false;
			}

		}
	}

	public class AgentStatus
	{
		public string status { get; set; }
	}
}
