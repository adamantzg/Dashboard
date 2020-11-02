using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RegistrationWebApp.Controllers;

namespace RegistrationWebApp
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = ApiKeyAuthenticationOptions.DefaultScheme;
				options.DefaultChallengeScheme = ApiKeyAuthenticationOptions.DefaultScheme;
			})
			.AddApiKeySupport(options => { });

			services.AddMemoryCache();
			services.AddScoped<DbContext, MyDbContext>();
			services.AddScoped<IDescriptorsService, DescriptorServiceSqLite>();
			services.AddScoped<DescriptorExpirationFilter>();			

			services.AddControllers().AddNewtonsoftJson(options => {
				options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
			}); ;

			services.AddCors(options =>
			{
				options.AddDefaultPolicy(
								  builder =>
								  {
									  builder.WithOrigins("http://access7.streamsink.com:8299",
														  "http://localhost:59971")
									  .AllowAnyHeader()									  
									  .AllowAnyMethod();
								  });
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			//if (env.IsDevelopment())
			//{
				app.UseDeveloperExceptionPage();
			//}

			app.UseCors();

			app.UseRouting();
			app.UseAuthentication();
			app.UseAuthorization();
			

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
			});
		}
	}
}
