import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DataConnection, Peer } from 'peerjs'
import { v4 as uuid } from 'uuid'
import cls from 'classnames'

import styles from './Lunch.module.scss'
import CopyPaste from '../../components/CopyPaste'
import { EType } from '../../constants'

interface IData {
  id: string
  content: {
    body: string
  }
  timestamp: number
}

const Lunch = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const idParams = id || ''
  const initialized = useRef(false)
  const [peer, setPeer] = useState<Peer>()
  const [connection, setConnection] = useState<DataConnection>()
  const [peerId, setPeerId] = useState(idParams)
  const [isConnected, setIsConnected] = useState(false)

  const [data, setData] = useState<IData[]>([])
  const [text, setText] = useState('')

  const initial = () => {
    const peer = new Peer()

    peer.on('open', (id) => {
      setPeer(peer)
      type === EType.Admin && setPeerId(id)
      console.log('=== My peer ID is: ' + id)
    })
    peer.on('connection', (conn) => {
      setConnection(conn)
    })
    peer.on('disconnected', () => {
      console.log('Connection lost. Please reconnect')
    })
    peer.on('close', () => {
      setConnection(undefined)
      console.log('Connection destroyed')
    })

    peer.on('error', (err) => {
      console.error(err)
      console.log('Something went wrong')
    })
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true

      initial()
    }

    return () => {
      console.log('=== peer', peer)
      peer?.destroy()
    }
  }, [])

  useEffect(() => {
    if (type === EType.Member && peer && idParams) {
      const conn = peer.connect(idParams, { reliable: true })
      setConnection(conn)
      setPeerId(idParams)
    }
  }, [peer, idParams, type])

  useEffect(() => {
    if (connection) {
      connection.on('open', () => {
        console.log('=== Connected to: ' + connection.peer)
        setIsConnected(true)
      })
      connection.on('data', (data) => {
        setData((prev) => [...prev, data as IData])
      })
      connection.on('close', () => {
        console.log('=== Connection closed')
        setIsConnected(false)
        setPeer(undefined)
        setConnection(undefined)
        setPeerId('')
        navigate('/' + type)
      })
    }
  }, [connection])

  const handleConnect = () => {
    const conn = peer?.connect(peerId, { reliable: true })

    setConnection(conn)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if (!isConnected || !connection) {
      console.error('=== Lost connection', connection)
      return
    }

    if (!text) {
      return
    }

    const newData: IData = {
      id: uuid(),
      content: {
        body: text as string,
      },
      timestamp: new Date().getTime(),
    }

    setData((prev) => [...prev, newData])
    connection.send(newData)
    setText('')
  }

  return (
    <div>
      {peerId && type === EType.Admin && (
        <div className={styles.header}>
          <CopyPaste value={peerId}>
            <h3>{peerId}</h3>
          </CopyPaste>
        </div>
      )}

      {type === EType.Member && (!peerId || (peerId && !isConnected)) && (
        <div>
          <input
            type="text"
            placeholder="Type a ID"
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
          />
          <button onClick={() => handleConnect()}>Connect</button>
        </div>
      )}

      {isConnected && (
        <div>
          <input
            type="text"
            value={text}
            autoFocus={true}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={() => handleSendMessage()}>Send</button>
        </div>
      )}

      {data.length > 0 ? (
        data.map((item) => <h3 key={item.id}>{item.content.body}</h3>)
      ) : (
        <>No Data</>
      )}
    </div>
  )
}

export default Lunch
