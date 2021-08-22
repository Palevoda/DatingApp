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
    public class MessagesController : BaseApiController
    {
        private readonly IUserRepository userRepository;
        private readonly IMessageRepository messageRepository;
        private readonly IMapper mapper;

        public MessagesController(IUserRepository userRepository, IMessageRepository messageRepository, IMapper mapper)
        {
            this.userRepository = userRepository;
            this.messageRepository = messageRepository;
            this.mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto messageDto) 
        {
            //var username = User.GetUserName();

            //if (username.Equals(messageDto.RecipientUsername.ToLower()))
            //    return BadRequest("You cannot send messages yourself");

            //var sender = await userRepository.GetUserByUserNameAsync(username);
            //var recipient = await userRepository.GetUserByUserNameAsync(messageDto.RecipientUsername.ToLower());

            //if (recipient == null) return NotFound();

            //var message = new Message
            //{
            //    Sender = sender,
            //    Recipient = recipient,
            //    SenderUsername = sender.UserName,
            //    RecipientUsername = recipient.UserName,
            //    Content = messageDto.Content
            //};

            //messageRepository.AddMessage(message);

            //if (await messageRepository.SaveAllAsync()) return Ok(mapper.Map<MessageDto>(message));

            return BadRequest("Failed to send message");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery]MessageParams messageParams) 
        {
            messageParams.Username = User.GetUserName();
            var messages = await messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(messages.currentPage, messages.pageSize, messages.totalCount, messages.totalPages);

            return messages;
        }

        [HttpGet("thread/{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
        {
            var currentUsername = User.GetUserName();

            return Ok(await messageRepository.GetMessageThread(currentUsername, username));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var username = User.GetUserName();

            var message = await messageRepository.GetMessage(id);

            if (message.Sender.UserName != username && message.Recipient.UserName != username)
                return Unauthorized();

            if (message.Sender.UserName.Equals(username)) message.SenderDeleted = true;
            if (message.Recipient.UserName.Equals(username)) message.RecipientDeleted = true;

            if (message.RecipientDeleted && message.SenderDeleted) messageRepository.DeleteMessage(message);

            if (await messageRepository.SaveAllAsync()) return Ok();

            return BadRequest("Smth go wrong");

        }


    }
}
