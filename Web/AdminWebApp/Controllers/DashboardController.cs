using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AdminWebApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AdminWebApp.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly AppSettings appSettings;

        public DashboardController(IUnitOfWork unitOfWork, IOptions<AppSettings> appSettings)
        {
            this.unitOfWork = unitOfWork;
            this.appSettings = appSettings.Value;
        }

        [HttpGet("")]
        public Dashboard GetDashboard()
        {
            var parsed = int.TryParse((User.Identity as ClaimsIdentity).FindFirst(ClaimTypes.PrimarySid)?.Value, out int userId);
            if (parsed)
                return unitOfWork.DashboardRepository.Get(d => d.UserId == userId, includeProperties: "Tabs.Widgets.WidgetType").FirstOrDefault();
            return null;
        }

        [HttpPost("")]
        public Dashboard Create(Dashboard d)
        {
            unitOfWork.DashboardRepository.Insert(d);
            unitOfWork.Save();
            return d;
        }

        [HttpPut("")]
        public Dashboard Update(Dashboard d)
        {
            unitOfWork.DashboardRepository.Update(d);
            unitOfWork.Save();
            return d;
        }
    }
}