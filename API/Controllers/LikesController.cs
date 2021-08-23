using API.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using API.Exstentions;
using API.Entities;
using API.DTOs;
using API.Helpers;

namespace API.Controllers
{
    [Authorize]
    public class LikesController : BaseApiController
    {
        private readonly IUnitOfWork unitOfWork;

        public LikesController(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username) 
        {
            var sourceUserUsername = User.GetUserName();
           // var sourceUser = userRepository.GetUserByUserNameAsync(sourceUserUsername);
            var likedUser = await unitOfWork.userRepository.GetUserByUserNameAsync(username);
            var sourceUser = await unitOfWork.likesRepository.GetUserWithLikes(sourceUserUsername);

            if (likedUser == null) return NotFound("Not found");

            if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

            var userLike = await unitOfWork.likesRepository.GetUserLike(sourceUserUsername, likedUser.Id);

            if (userLike != null) return BadRequest("You already liked this user");

            userLike = new UserLike
            {
                SourceUserId = sourceUser.Id,
                LikedUserId = likedUser.Id
            };

            sourceUser.LikedUsers.Add(userLike);

            if (await unitOfWork.Complete()) return Ok();

            return BadRequest("Failed to like user");
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery]LikesParams likesParams)
        {
            var user = await unitOfWork.userRepository.GetUserByUserNameAsync(User.GetUserName());
            likesParams.UserId = user.Id;
            var users = await unitOfWork.likesRepository.GetUserLikes(likesParams);

            Response.AddPaginationHeader(users.currentPage, users.pageSize, users.totalCount, users.totalPages);

            return Ok(users);
        }
    }
}
