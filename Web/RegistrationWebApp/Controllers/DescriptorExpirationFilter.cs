using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RegistrationWebApp.Controllers
{
    public class DescriptorExpirationFilter : IActionFilter
    {
        private readonly IDescriptorsService descriptorsService;

        public DescriptorExpirationFilter(IDescriptorsService descriptorsService)
        {
            this.descriptorsService = descriptorsService;
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            descriptorsService.RemoveExpired();
        }
    }
}
