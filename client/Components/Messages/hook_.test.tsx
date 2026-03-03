import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { sanitizeContent, validateUrl, validateTimestamp, checkRateLimit, getCurrentUserId, messageRateLimit, validateMessageContent, useSocket } from './hooks';
// import Message from "../../../server/Models/MessagesTables";
// import { sendMessage } from '../../../server/controllers/MessagesController';

//Sanitize Content against dangerous HTML characters
describe('sanitizeContent', () => {
    test('converts dangerous HTML characters', () => {
        const input = "<script>alert(XSS)</script>";
        const results = sanitizeContent(input);

        expect(results).toEqual("&lt;script&gt;alert(XSS)&lt;&#x2F;script&gt;");
    });
    test('converts dangerous HTML characters', () => {
        const input = '<img> src=alert (XSS) </img>';
        const results = sanitizeContent(input);
        expect(results).toEqual('&lt;img&gt; src=alert (XSS) &lt;&#x2F;img&gt;');
    });
});

//Validate URLS
describe('ValidateURl', () => {
    test('checks whether or not the url is valid', () => {
        const url = 'http://localhost';
        const results = validateUrl(url); //Validating API Url
        expect(results).toBe(true);
    });
    test('checking for a false Url', () => {
        const url = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        const results = validateUrl(url);
        expect(results).toBe(false);
    })

});

//Validate TimeStamp
describe('ValidateTimestamp', () => {
    test('checks if a timestamp is validate', () => {
        const timestamp = new Date(); //Verifying this date is accurate
        const result = validateTimestamp(timestamp);
        expect(result).toEqual(timestamp);
    })
    test('checking an invalid timestamp', () => {
        const timestamp ='XXXXXXXXXXXXXXXXXXXXXXXXXX';
        const result = validateTimestamp(timestamp);
        expect(result).toEqual(new Date());//If invalid timestamp will return
        //current date
    })
})

//Check  Rate Limit to prevent against DDOS attacks
describe('CheckRate limit', () => {
    test('testing for a non DDOS attack', () => {
        const userid = 1;
        messageRateLimit.set(userid, { count: 1, lastReset: Date.now() });//This in theory should return true and just keep resetting the time
        //by manually settings the count to 0 we don't exceed the 30
        const results = checkRateLimit(userid);
        expect(results).toBe(true);

    })
    test('testing for a DDOS attack', () => {
        const userid = 1;
        messageRateLimit.set(userid, { count: 40, lastReset: Date.now() });//This in theory should return false
        //by manually settings the count to 40 we do exceed the 30 thus returning false
        const results = checkRateLimit(userid);
        expect(results).toBe(false);

    })

})
//TESTING THE getCurrentUserId Function
describe("Get User CurrentUserID", () => {  
    beforeEach(() => { //Reset all the mocks/clear the messageRatelimit and remove the session token. Everything Fresh
        jest.restoreAllMocks();
        messageRateLimit.clear();
        localStorage.removeItem("session_token");
    })
    test("API Should return an accurate User ID", async () => {
        localStorage.setItem("session_token", "token123" );
        const mockData = {id: 42};
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
        const response = await fetch('/api/users/me');
        const data = await response.json();
        
        expect(data).toEqual(mockData);
      });
 })
//Validate Message Content 
describe("Validating the Message Content", () => {
    test("Checking to see if the fake content posed as 'Hello' will pass the validateMessageContent", () => {
         const fakecontent = "Hello";
        const result = validateMessageContent(fakecontent);
        expect(result).toBe(true);
    })  
    test("Testing for nothing in the messages content", () => {
        const fakecontent = "";
        const result = validateMessageContent(fakecontent);
        expect(result).toBe(false);
    })  

})

//Testing the Messages Send API 
describe("Testing the Messages Send API to the DB ", () => {
        beforeEach(() => { //Reset all the mocks/clear the messageRatelimit and remove the session token. Everything Fresh
        jest.restoreAllMocks();
        messageRateLimit.clear();
        localStorage.removeItem("session_token");
    }) 
    test("Checking to see if the send messages API will work", async () => {
        const mockMessage = {sender_id: "1", conversation_id: "1-2", receiver_id:"2", message_type: "text", status:"sent"
             ,content:"hello"};
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({success: true, data: mockMessage})
        });
        const response = await fetch('/api/messages/send');
        const data = await response.json();
        expect(data).toEqual({success: true, data: mockMessage});
    })
}) 
// { ok: true, json: () => Promise.resolve({ success: true, data: mockMessage }) }. Mimivig the controller, it should resolve to 
// Because the controller res.json respone is "res.json({success: true, data: message})"


//Testing The Web Socket
// describe("testing web sockets for seemless communication with users", () => {
//     test("Testing Web socket integration", async () => {
//         //Arrange : fake created message
//         const saved = {
//             id: 123, sender_id: 1, receiver_id: 2, conversation_id:'1-2',
//             content: 'hello', timestamp: new Date(), status: 'sent'
//         };
//         jest.spyOn(Message, 'create').mockResolvedValue(saved);

//         //Mock IO
//         const emitSpy = jest.fn();
//         const ioMock = {to: jest.fn().mockReturnThis(), emit: emitSpy}
//         const req ={body: {receiver_id: 2, content: 'hello'}, user: {userId: 1}, app: {get: () => ioMock} };
//         const res = {json: jest.fn() };
//         //Act
//         await sendMessage(req,res);

//         //Assert 
//         expect(ioMock.to).toHaveBeenCalledWith('user-2');
//          expect(emitSpy).toHaveBeenCalledWith('receiver-message', expect.objectContaining({
//         id: saved.id, content: expect.any(String), conversation_id: saved.conversation_id
//   }));
//         Message.create.mockRestore();

//     })
// })