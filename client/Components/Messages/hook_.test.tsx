import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { sanitizeContent, validateUrl, validateTimestamp, checkRateLimit, messageRateLimit} from './hooks';

//Sanitize Content against dangerous HTML characters
describe('sanitizeContent', () => {
    test('converts dangerous HTML characters', () => {
        const input = '<script>alert("XSS")</script>';
        const results = sanitizeContent(input);

        expect(results).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });
    test('converts dangerous HTML characters', () => {
        const input = '<img> src=alert (XSS) </img>';
        const results = sanitizeContent(input);
        expect(results).toBe('&lt;img&gt; src=alert (XSS) &lt;&#x2Fimg&gt;');
    });
});

//Validate URLS
describe('ValidateURl', () => {
    test('checks whether or not the url is valid', () => {
        const url = 'http://localhost:1034/Ilike/code';
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
        const timestamp = '2023-11-11T00:00:00.000Z'; //Verifying this date is accurate
        const result = validateTimestamp(timestamp);
        expect(result).toBe(timestamp);
    })
    test('checking an invalid timestamp', () => {
        const timestamp ='XXXXXXXXXXXXXXXXXXXXXXXXXX';
        const result = validateTimestamp(timestamp);
        expect(result).toBe(new Date());//If invalid timestamp will return
        //current date
    })
})

//Check  Rate Limit to prevent against DDOS attacks
describe('CheckRate limit', () => {
    test('testing for a non DDOS attack', () => {
        const userid = 1;
        const messageRateLimit = new Map<number, { count: number; lastReset: number }>();
        messageRateLimit.set(userid, { count: 1, lastReset: Date.now() });//This in theory should return true and just keep resetting the time
        //by manually settings the count to 0 we don't exceed the 30
        const results = checkRateLimit(userid);
        expect(results).toBe(true);

    })
    test('testing for a DDOS attack', () => {
        const userid = 1;
        const messageRateLimit = new Map<number, { count: number; lastReset: number }>();
        messageRateLimit.set(userid, { count: 40, lastReset: Date.now() });//This in theory should return false
        //by manually settings the count to 40 we do exceed the 30 thus returning false
        const results = checkRateLimit(userid);
        expect(results).toBe(false);

    })

})




