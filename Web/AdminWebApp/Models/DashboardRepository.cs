using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminWebApp.Models
{
    public class DashboardRepository : GenericRepository<Dashboard>
    {
        public DashboardRepository(DbContext context) : base(context)
        {
        }

        public override void Update(Dashboard entityToUpdate)
        {
            var existing = dbSet.Include("Tabs.Widgets").FirstOrDefault(d => d.Id == entityToUpdate.Id);
            if(existing != null)
            {
                context.Entry(existing).CurrentValues.SetValues(entityToUpdate);
                foreach(var tab in entityToUpdate.Tabs)
                {
                    if(tab.Id <= 0)
                    {
                        existing.Tabs.Add(tab);
                    }
                    else
                    {
                        var existingTab = existing.Tabs.FirstOrDefault(t => t.Id == tab.Id);
                        if(existingTab != null)
                        {
                            context.Entry(existingTab).CurrentValues.SetValues(tab);
                            foreach(var widget in tab.Widgets)
                            {
                                if(widget.Id <= 0)
                                {
                                    existingTab.Widgets.Add(widget);
                                }
                                else
                                {
                                    var existingWidget = existingTab.Widgets.FirstOrDefault(w => w.Id == widget.Id);
                                    if(existingWidget != null)
                                    {
                                        context.Entry(existingWidget).CurrentValues.SetValues(widget);
                                    }
                                }
                            }
                            foreach(var ew in existingTab.Widgets)
                            {
                                if(!tab.Widgets.Any(w=>w.Id == ew.Id))
                                {
                                    context.Remove(ew);
                                }
                            }
                        }
                    }
                }
                foreach (var et in existing.Tabs)
                {
                    if (!entityToUpdate.Tabs.Any(t => t.Id == et.Id))
                    {
                        context.Remove(et);
                    }
                }

            }
            
        }
    }
}
