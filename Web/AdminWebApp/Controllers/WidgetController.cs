using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AdminWebApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AdminWebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WidgetController : ControllerBase
    {
        private readonly IUnitOfWork unitOfWork;

        public WidgetController(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
        }

        [HttpPut("")]
        public Widget Update(Widget widget)
        {
            unitOfWork.WidgetRepository.Update(widget);
            unitOfWork.Save();
            return widget;
        }

        [HttpGet("types")]
        public IEnumerable<WidgetType> GetTypes()
        {
            return unitOfWork.WidgetTypeRepository.Get();
        }
    }
}