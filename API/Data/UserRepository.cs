using API.Entities;
using API.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Helpers;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public UserRepository(DataContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<MemberDto> GetMemberAsync(string username)
        {
            return await context.Users.
                Where(user => user.UserName.Equals(username)).
                ProjectTo<MemberDto>(mapper.ConfigurationProvider).
                SingleOrDefaultAsync();
        }

        public async Task<IEnumerable<MemberDto>> GetMembersAsync()
        {
            return await context.Users.ProjectTo<MemberDto>(mapper.ConfigurationProvider).ToListAsync();
        }

        public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
        {
            var query = context.Users.AsQueryable();

            query = query.Where(x => x.Gender.Equals(userParams.Gender)); //
            query = query.Where(x => !x.UserName.Equals(userParams.CurrentUsername));

            var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
            var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

            query = query.Where(x => x.DateOfBirth >= minDob && x.DateOfBirth <= maxDob);

            query = userParams.OrderBy switch
            {
                "created" => query = query.OrderByDescending(u => u.Created),
                _ => query = query.OrderByDescending(u => u.LastActive)
            };

            return await PagedList<MemberDto>.CreateAsync(
                query.ProjectTo<MemberDto>(mapper.ConfigurationProvider).AsNoTracking(), 
                userParams.PageNumber, 
                userParams.PageSize);
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUserNameAsync(string username)
        {
            return await context.Users.Include(user => user.Photos).SingleOrDefaultAsync(x => x.UserName.Equals(username)); 
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await context.Users.Include(user => user.Photos).ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public void Update(AppUser user)
        {
            context.Entry(user).State = EntityState.Modified; 
        }
    }
}
