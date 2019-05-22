# MessageBoard-App
live demo: https://messageboard-app.herokuapp.com
Final Project for ACS-3909
MessageBoard-App
Final Project for ACS-3909

This is a web application that allows users to post messages to a common message board. The web application satisfies the following requirements.

# Requirements
- The application authenticates and authorizes users to view restricted pages.

- There are two types of users for this web application: administrator and regular.

- All users can post a string(140 characters or less) to the common message board.

    - Each post consists of a username(of the user that posted the message), the message, and a timestamp giving the date and time the message was posted.
- Regular users have access to the following restricted pages

  - Common message board page
      - Contains an option to post a message
      - Updates/displays all users' posts
  - User posts page
      - Lists messages/posts only posted by the currently logged-in user
      - Each post contains a button allowing the user to delete the post
  - Settings page
      - Allows the user to specify whether the post should be listed newest to oldes or vice versa
      - Another setting of my choice
      - Settings must be persisted and saved using cookies
  - Administrators have access to the following restricted pages.

  - Common message board page
      - Contains an option to post a message
      - Updates/displays all users' posts
      - Each message contains a button allowing the administrator to delete the post
  - Users page
      - List all the current users
      - Contains a button next to each user to delete the user
      - Contains a button next to each user to disable/enable the ability for that user to post messages
  - Create Users page
      - Allows the administrator to create a new user
- The two user types(regular/administrator) have a menu on each page with liks to other restricted pages

  - The menu contains a logout link
  - Regular users are not able to access administrator pages
