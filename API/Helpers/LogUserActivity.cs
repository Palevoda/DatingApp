using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using API.Exstentions;
using API.Interfaces;
using API.Entities;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next(); //?

            if (!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

            var username = resultContext.HttpContext.User.GetUserName();
            var uow = resultContext.HttpContext.RequestServices.GetService<IUnitOfWork>();
            var user = await  uow.userRepository.GetUserByUserNameAsync(username);

            user.LastActive = DateTime.Now;
            await uow.Complete(); ;

        }
    }
}
