using API.Data;
using API.DTOs;
using API.Entities;
using API.Exstentions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;



namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        private readonly IPhotoService photoService;
        public UsersController(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
            this.photoService = photoService;
        }
        
      //  [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery]UserParams userParams)
        {
            var gender = await unitOfWork.userRepository.GetUserGender(User.GetUserName()); //
            userParams.CurrentUsername = User.GetUserName();

            if (string.IsNullOrEmpty(userParams.Gender))
                userParams.Gender = gender == "male" ? "female" : "male";

            var users = await unitOfWork.userRepository.GetMembersAsync(userParams);
            Response.AddPaginationHeader(users.currentPage, users.pageSize, users.totalCount, users.totalPages);
            return Ok(users);
        }
        [Authorize(Roles = "Member")]
        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username) //
        {
            return await unitOfWork.userRepository.GetMemberAsync(username);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var user = await unitOfWork.userRepository.GetUserByUserNameAsync(User.GetUserName());

            mapper.Map(memberUpdateDto, user);

            unitOfWork.userRepository.Update(user);

            if (await unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await unitOfWork.userRepository.GetUserByUserNameAsync(User.GetUserName());

            var result = await photoService.AddImageAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            if (user.Photos.Count == 0)
            {
                photo.isMain = true; 
            }

            user.Photos.Add(photo);

            if (await unitOfWork.Complete())
            {
                return CreatedAtRoute(
                    "GetUser", 
                    new { username = user.UserName }, 
                    mapper.Map<PhotoDto>(photo));                 
            }
                

            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId) 
        {
            var user = await unitOfWork.userRepository.GetUserByUserNameAsync(User.GetUserName());

            var photo = user.Photos.FirstOrDefault(x=> x.Id == photoId);

            if (photo.isMain == true) return BadRequest("This photo is main");

            var currentMain = user.Photos.FirstOrDefault(x => x.isMain);

            if (currentMain != null) currentMain.isMain = false;

            photo.isMain = true;

            if (await unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to set main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId) 
        {
            var user = await unitOfWork.userRepository.GetUserByUserNameAsync(User.GetUserName());

            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo == null) return BadRequest("Photo is no found");

            if (photo.isMain) return BadRequest("You cant delete main photo");

            if (photo.PublicId != null)
            {
                var result = await photoService.DeleteImageAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }

            user.Photos.Remove(photo);

            if (await unitOfWork.Complete()) return Ok();

            return BadRequest("Something go wrong");

        }
    }
}
