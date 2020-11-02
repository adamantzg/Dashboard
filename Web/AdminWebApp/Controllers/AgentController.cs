using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AdminToolsLib;
using AdminWebApp.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace AdminWebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AgentController : ControllerBase
    {
        private readonly IUnitOfWork unitOfWork;        
        private readonly AppSettings appSettings;

        public AgentController(IUnitOfWork unitOfWork, IOptions<AppSettings> appSettings)
        {
            this.unitOfWork = unitOfWork;            
            this.appSettings = appSettings.Value;
        }

        [HttpGet("")]
        public async Task<DescriptorsModel> GetAgentDescriptorsModel()
        {
            //Call registrationwebapi and get all agent descriptors
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-Api-Key", appSettings.AgentDescriptorsApiKey);
                var response = await client.GetAsync(appSettings.AgentDescriptorsApiUrl);
                return new DescriptorsModel
                {
                    Descriptors = JsonConvert.DeserializeObject<List<AgentDescriptor>>(response.Content.ReadAsStringAsync().Result),
                    RegistrationWebAppUrl = this.appSettings.AgentDescriptorsApiUrl
                };
            }
        }
                

        [HttpPut("")]
        public async Task<IActionResult> UpdateAgent(AgentDescriptor descriptor)
        {
            //Call registrationwebapi and get all agent descriptors
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-Api-Key", appSettings.AgentDescriptorsApiKey);
                var response = await client.PutAsync(appSettings.AgentDescriptorsApiUrl,
                    new StringContent(JsonConvert.SerializeObject(descriptor),Encoding.UTF8,"application/json"));
                if(response.StatusCode == System.Net.HttpStatusCode.OK)
                    return Ok(JsonConvert.DeserializeObject<AgentDescriptor>(response.Content.ReadAsStringAsync().Result));
                return BadRequest(response.Content.ReadAsStringAsync().Result);
            }
        }

        [HttpPut("updateLastActive")]
        public async Task<IActionResult> UpdateLastActive(AgentDescriptor descriptor)
        {
            //Call registrationwebapi and get all agent descriptors
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-Api-Key", appSettings.AgentDescriptorsApiKey);
                var response = await client.PutAsync($"{appSettings.AgentDescriptorsApiUrl}/updateLastActive" ,
                    new StringContent(JsonConvert.SerializeObject(descriptor), Encoding.UTF8, "application/json"));
                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                    return Ok(JsonConvert.DeserializeObject<AgentDescriptor>(response.Content.ReadAsStringAsync().Result));
                return BadRequest(response.Content.ReadAsStringAsync().Result);
            }
        }

        [HttpDelete("")]
        public async void DeleteAgent(string id)
        {
            //Call registrationwebapi and get all agent descriptors
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-Api-Key", appSettings.AgentDescriptorsApiKey);
                await client.DeleteAsync($"{appSettings.AgentDescriptorsApiUrl}?id={id}");
            }
        }
    }

    public class DescriptorsModel
    {
        public List<AgentDescriptor> Descriptors { get; set; }
        public string RegistrationWebAppUrl { get; set; }
    }
}
