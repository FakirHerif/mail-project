document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-details-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function email_view(id) {
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-details-view').style.display = 'block';

    document.querySelector('#emails-details-view').innerHTML = `
    <ul class="list-group">
    <li class="list-group-item"><strong>From: </strong>${email.sender}</li>
    <li class="list-group-item"><strong>To: </strong>${email.recipients}</li>
    <li class="list-group-item"><strong>Subject: </strong>${email.subject}</li>
    <li class="list-group-item"><strong>Msg: </strong>${email.body}</li>
    <li class="list-group-item"><strong>Timestamp: </strong>${email.timestamp}</li>
    </ul>
    `

    if(!email.read) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      
    }


    const buttonArchive = document.createElement('button');
    buttonArchive.innerHTML = email.archived ? "Unarchive" : "Archive"
    buttonArchive.className = email.archived ? "btn btn-success" : "btn btn-danger"
    buttonArchive.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
      .then(() => { load_mailbox('archive') } )
    });
    document.querySelector('#emails-details-view').append(buttonArchive);


    const buttonReply = document.createElement('button');
    buttonReply.innerHTML = "Reply"
    buttonReply.className = "btn btn-info";
    buttonReply.addEventListener('click', function() {
      compose_email();

      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if(subject.split(' ',1)[0] != "Re:"){
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = email.subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} - Sender: ${email.sender} - Msg: ${email.body}`;

    });
    document.querySelector('#emails-details-view').append(buttonReply);

    // ... do something else with email ...
});

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-details-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    // Print emails
    emails.forEach(onlyEmail => {

      console.log(onlyEmail);
      
      const new_email = document.createElement('div');
      new_email.className = "list-group-item";
      new_email.innerHTML = `
      <h6>Sender: ${onlyEmail.sender}</h6>
      <h5>Subject: ${onlyEmail.subject}</h5>
      <p>Timestamp: ${onlyEmail.timestamp}</p>
      `;

      new_email.className = onlyEmail.read ? 'read': 'unread';
      new_email.addEventListener('click', function() {
        email_view(onlyEmail.id)
      });
      document.querySelector('#emails-view').append(new_email);

    });

    // ... do something else with emails ...
});

}

function send_email(event) {
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
  
}
