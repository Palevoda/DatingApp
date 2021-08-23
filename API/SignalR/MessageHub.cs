using API.DTOs;
using API.Entities;
using API.Exstentions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;
        private readonly IHubContext<MessageHub> presence;
        private readonly PresenceTracker tracker;

        public MessageHub(IUnitOfWork unitOfWork, IMapper mapper, IHubContext<MessageHub> presence, PresenceTracker tracker)
        {
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
            this.presence = presence;
            this.tracker = tracker;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUserName(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdateGroup", group); 


            var messages = await unitOfWork.messageRepository.GetMessageThread(Context.User.GetUserName(), otherUser);

            if (unitOfWork.hasChanges()) await unitOfWork.Complete();

            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdateGroup", group);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto messageDto)
        {
            var username = Context.User.GetUserName();

            if (username.Equals(messageDto.RecipientUsername.ToLower()))
                throw new HubException("You cannot send messages yourself");

            var sender = await unitOfWork.userRepository.GetUserByUserNameAsync(username);
            var recipient = await unitOfWork.userRepository.GetUserByUserNameAsync(messageDto.RecipientUsername.ToLower());

            if (recipient == null) throw new HubException("Not found");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = messageDto.Content
            };

            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await unitOfWork.messageRepository.GetMessageGroup(groupName);

            if (group.connections.Any(x => x.Username.Equals(recipient.UserName)))
            {
                message.DateRead = DateTime.Now;
            }
            else 
            {
                var connections = await tracker.GetConnectionsForUser(recipient.UserName);
                if (connections != null)
                {

                    //  await Clients.Others.SendAsync("NewMessageReceived", new { username = "ada", knownAs = "Ada", from = "Grant" });
                    await presence.Clients.Clients(connections).SendAsync("NewMessageReceived",
                        new { username = sender.UserName, knownAs = sender.KnownAs });

                    //await Clients.Group(groupName).SendAsync("NewMessageReceived", new { username = sender.UserName, knownAs = sender.KnownAs });
                    await Clients.Others.SendAsync("UserIsOnline", "Тест message received");
                }
            }

            unitOfWork.messageRepository.AddMessage(message);
            

            if (await unitOfWork.Complete())
            {                
                await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
            } 


        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await unitOfWork.messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

            if (group == null)
            {
                group = new Group(groupName);
                unitOfWork.messageRepository.AddGroup(group);
            }

            group.connections.Add(connection);

            if (await unitOfWork.Complete()) return group;

            throw new HubException("Failed to join group");
        }

        private async Task<Group> RemoveFromMessageGroup()
        {
            var group = await unitOfWork.messageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group.connections.FirstOrDefault(x=>x.ConnectionId==Context.ConnectionId);
            unitOfWork.messageRepository.RemoveConnection(connection);
            if (await unitOfWork.Complete()) return group;

            throw new HubException("Failed to remove from group ");
        }

        private string GetGroupName(string caller, string other) 
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
    }
}
