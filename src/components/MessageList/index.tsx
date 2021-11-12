import { api } from '../../services/api'

import styles from './styles.module.scss'
import logoImg from '../../assets/logo.svg'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

let messagesQueue: Message[] = []

const socket = io('http://localhost:3000')

socket.on('newMessage', (message: Message) => {
  messagesQueue.push(message)
  console.log(message)
})

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    api.get<Message[]>('messages/last3').then(response => {
      setMessages(response.data)
    })
  }, [])

  useEffect(() => {
    setInterval(() => {
      if(messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1]
        ].filter(Boolean))

        messagesQueue.pop()
      }
    }, 3000)
  }, [])

  return(
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile2021" />

      <ul className={styles.messageList}>

        {
          messages.map((message) => {
            return(
              <li className={styles.message} key={message.id}>
                <p className={styles.messageContent}> {message.text} </p>
                <div className={styles.messageUser}>
                  <div className={styles.userImage}>
                    <img src={message.user.avatar_url} alt={message.user.name} />
                  </div>

                  <span> {message.user.name} </span>
                </div>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}