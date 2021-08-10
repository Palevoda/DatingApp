using API.Data;
using API.Entities;
using API.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.Interfaces;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly DataContext context;
        private readonly ITokenService tokenService;
        private readonly IUserRepository repository;
        public AccountController(DataContext context, ITokenService tokenService, IUserRepository repository)
        {
            this.context = context;
            this.tokenService = tokenService;
            this.repository = repository;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");

            using var hmack = new HMACSHA512();

            var user = new AppUser
            {
                UserName = registerDto.Username.ToLower(),
                PasswordHash = hmack.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmack.Key
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return new UserDto
            {
                Username = user.UserName,
                Token = tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.isMain)?.Url
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            //var user = await context.Users.SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());            

            var user = await repository.GetUserByUserNameAsync(loginDto.Username.ToLower());

            if (user == null) return Unauthorized("Invalid username");

            using var hmack = new HMACSHA512(user.PasswordSalt);

            var hash = hmack.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < hash.Length; i++)
            {
                if (hash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
            }

            return new UserDto
            {
                Username = user.UserName,  
                Token = tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x=>x.isMain)?.Url
            };
        }

        private async Task<bool> UserExists(string username)
        {
            return await context.Users.AnyAsync(any => any.UserName.Equals(username));
        }
    }
}
