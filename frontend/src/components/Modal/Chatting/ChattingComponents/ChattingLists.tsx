import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Chatting.module.scss';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { modalStore } from '../../store/modal';
import ChatApi from '../../../../common/api/ChatAPI';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { getToken } from '../../../../common/api/jWT-Token';

const StyledBadgeOnline = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledBadgeOffline = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#f8f8f8',
    color: '#f8f8f8',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

function ChattingLists({
  isShow,
  name,
  content,
  time,
  roomId,
  client,
  image,
  privateChats,
  setPrivateChats,
  scrollbarRef,
  setIsShow,
  login,
  handleSubscribe,
  unsub,
}: any) {
  const [subList, setSubList] = useState<any>([]);
  const subListRef = useRef(subList);
  subListRef.current = subList;
  const [newTime, setNewTime] = useState(dayjs(time));
  const [isOnline, setIsOnline] = useState(login);
  const { romId, setRoomId, setHistory } = modalStore();
  const [lastMessage, setLastMessage] = useState<string>(content);
  const { enterChatRoom, fetchWithToken } = ChatApi;

  const enterChattingRoom = async () => {
    const result = await enterChatRoom(roomId);
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollToBottom();
    }
    setHistory(result.data);
  };

  const savePrivateChats = (data: any) => {
    setPrivateChats(data);
  };

  const onClickSetShow = () => {
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollToBottom();
    }
    setIsShow(true);
  };

  const subscribe = () => {
    const list = [];
    list.push(
      client.current.subscribe(`/sub/chat/room/${roomId}`, ({ body }: any) => {
        const data = JSON.parse(body);
        setLastMessage(data.content);
        setNewTime(data.realTime);
        if (scrollbarRef.current) {
          scrollbarRef.current.scrollToBottom();
        }
      }),
    );
    // ?????? // ???????????????, subList?????? ?????? ???????????????, ????????? list??? ??????
    setSubList([...subListRef.current, list]);
  };

  const subscribeDef = async () => {
    //??????
    // ?????? ?????? ??????,,?! ?????? ??? ???????????? ??? ????????? ???????????? ????????? ???????????????
    // ????????? ???????????? ????????? ??????????!
    // subscrption??? ????????? ?????? ????????? ??????. so subscribeDef??? ????????? ????????? index(??????)???
    // ?????? subscrption?????? ?????? ????????? ???????????? ??????
    // unsub?????? ?????? ???????????? ???????????? ???????????? ?????????,,,! ?????????????????? ?????? ????????? ?????? ??? ??? ?????? ??????.
    // ??????(?????? => ?????? => ????????? ?????? ??????)
    unsub();

    //?????? ????????? ?????? ??????,, ????????? ????????????,,,
    setPrivateChats(new Map());
    let res;
    res = await client.current.subscribe(`/sub/chat/room/detail/${roomId}`, ({ body }: any) => {
      const payloadData = JSON.parse(body);
      if (privateChats.get(payloadData.chatRoomSeq)) {
        privateChats.get(payloadData.chatRoomSeq).push(payloadData);
        savePrivateChats(new Map(privateChats));
        if (scrollbarRef.current) {
          scrollbarRef.current.scrollToBottom();
        }
      } else {
        let lst = [];
        lst.push(payloadData);
        privateChats.set(payloadData.chatRoomSeq, lst);
        savePrivateChats(new Map(privateChats));
        if (scrollbarRef.current) {
          scrollbarRef.current.scrollToBottom();
        }
      }
    });
    handleSubscribe(res);
  };

  useEffect(() => {
    subscribe();
    return () => {
      subListRef.current.forEach((topic: any, i: number) => {
        topic[i].unsubscribe();
      });
    };
  }, [roomId]);

  return (
    <div
      id="trigger"
      className={styles.onFocus}
      style={
        isShow ? {
          position : "relative", 
          display: 'flex', 
          cursor: 'pointer', 
          marginBottom: '20px', 
          width: '250px' 
        }  : 
        { 
          position : "relative", 
          display: 'flex', 
          cursor: 'pointer', 
          marginBottom: '20px', 
          width: '100%' 
        }}
      onClick={() => {
        subscribeDef();
        enterChattingRoom();
        setRoomId(roomId);
        onClickSetShow();
      }}
    >
      <div style={{ marginLeft: '-35px' }}>
        {isOnline ? (
          <StyledBadgeOnline
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar alt="??????" src={image} sx={{ width: 56, height: 56 }} />
          </StyledBadgeOnline>
        ) : (
          <StyledBadgeOffline
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar alt="??????" src={image} sx={{ width: 56, height: 56 }} />
          </StyledBadgeOffline>
        )}
      </div>
      <div style={isShow ? { maxWidth: '130px' } : {maxWidth : '250px'}}>
        <div style={{ marginTop: '10px', marginLeft: '10px',
        paddingRight: '30px',
        overflow: "hidden",
        whiteSpace : "nowrap",
        textOverflow: "ellipsis"}}>{name}</div>
        <span className={styles.lastMessage} style={{ color: '#B6A7A7', marginLeft: '10px', marginTop: '5px' }}>
          {lastMessage}
        </span>
      </div>
      <div>
        <div style={{ position: 'absolute', right : 0 }}>
          {time === null ? null : (
            <div style={{ fontSize: '15px', color: '#B6A7A7' }}>{dayjs(newTime).format('MM???DD??? h:mm A')}</div>
          )}
          {/* <div className={styles.count}>{unreads}</div> */}
        </div>
      </div>
    </div>
  );
}

export default ChattingLists;
