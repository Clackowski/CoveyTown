import { Button, Heading, StackDivider, VStack, useToast, Text, Image, Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ConversationAreasList from './ConversationAreasList';
import PlayersList from './PlayersList';
import PlayerData from '../../classes/PlayerData';
import TownController from '../../classes/TownController';

export default function SocialSidebar(props: {controller: TownController}): JSX.Element {
  //const [playerCoveyCoin, setPlayerCoveyCoin] = useState('');
  const [dailyCoveyCoinMessage, setDailyCoveyCoinMessage] = useState('Coins have been Collected');
  const [dailyCoveyCoinMessageColor, setDailyCoveyCoinMessageColor] = useState('green');
  const toast = useToast();

  async function handleGetData() {
    const pData = new PlayerData();
      /*
      pData.getCollectDate returns the given user's last collection date in a string formatted like so:
      YYYY-MM-DDTHH:mm:SS.[3 digits Milliseconds]Z Where Y=year, M=Month, D=Day, T=T, H=Hour, m=Minute, S=Second, and Z marks it as UTC
      Example: 2023-11-21T18:35:13.007Z
      The date given is always from UTC (Coordinated Universal Time)
      */
       const currentDate = new Date;
       const dateRetrievedLast = await pData.getCollectDate(props.controller.ourPlayer.userName);
       // If player has never gained coin before set the collect date and gain coins, then update coveycoin display
       if (dateRetrievedLast === null) {
          const coveyCoinGained = Math.round(Math.random() * 80 + 20);
          await pData.addCoveyCoin(props.controller.ourPlayer.userName, coveyCoinGained);
          await props.controller.ourPlayer.updateLocalInventory();
          toast({
            title: 'Daily Covey Coins Collected!',
            description: `You gained ${coveyCoinGained} Covey Coins.`,
            status: 'success',
          });
          await pData.setCollectDate(props.controller.ourPlayer.userName);
          const pCoveyCoin = await pData.getCoinCount(props.controller.ourPlayer.userName);
          //setPlayerCoveyCoin(pCoveyCoin.toString());
          setDailyCoveyCoinMessage("Coins have been Collected");
          setDailyCoveyCoinMessageColor('red');
          return;
       }

       const year = parseInt(dateRetrievedLast.substring(0, 4), 10);
       const month = parseInt(dateRetrievedLast.substring(5, 7), 10);
       const day = parseInt(dateRetrievedLast.substring(8, 10), 10);
       // These checks basically check if it is the next day or not
       if (currentDate.getUTCFullYear() > year || currentDate.getMonth() > month || currentDate.getUTCDay() > day) {
          const coveyCoinGained = Math.round(Math.random() * 80 + 20);
          await pData.addCoveyCoin(props.controller.ourPlayer.userName, coveyCoinGained);
          await props.controller.ourPlayer.updateLocalInventory();
          toast({
            title: 'Daily Covey Coins Collected!',
            description: `You gained ${coveyCoinGained} Covey Coins.`,
            status: 'success',
          });
          await pData.setCollectDate(props.controller.ourPlayer.userName);
          setDailyCoveyCoinMessage("Coins have been Collected");
          setDailyCoveyCoinMessageColor('red');
       }
    const pCoveyCoin = await pData.getCoinCount(props.controller.ourPlayer.userName);
    //setPlayerCoveyCoin(pCoveyCoin.toString());
  }

  useEffect(() => {

    const pData = new PlayerData();

    const setTheCoins = async () => {
      const currentDate = new Date;
      await pData.addPlayer(props.controller.ourPlayer.userName);
      const pCoveyCoins = await pData.getCoinCount(props.controller.ourPlayer.userName);
      //setPlayerCoveyCoin(pCoveyCoins.toString());
      const dateRetrievedLast = await pData.getCollectDate(props.controller.ourPlayer.userName);
       // If player has never gained coin before set the collect date and gain coins, then update coveycoin display
       if (dateRetrievedLast === null) {
        setDailyCoveyCoinMessage('Collect your Daily Covey Coins!');
        setDailyCoveyCoinMessageColor('green');
       } else {
      const year = parseInt(dateRetrievedLast.substring(0, 4), 10);
       const month = parseInt(dateRetrievedLast.substring(5, 7), 10);
       const day = parseInt(dateRetrievedLast.substring(8, 10), 10);
       // These checks basically check if it is the next day or not
       if (currentDate.getUTCFullYear() > year || currentDate.getMonth() > month || currentDate.getUTCDay() > day) {
         const pCoveyCoins = await pData.getCoinCount(props.controller.ourPlayer.userName);
         //setPlayerCoveyCoin(pCoveyCoins.toString());
         setDailyCoveyCoinMessage('Collect your Daily Covey Coins!');
         setDailyCoveyCoinMessageColor('green');
       } else {
         setDailyCoveyCoinMessage("Coins have been Collected");
         setDailyCoveyCoinMessageColor('red');
       }
      }
    }
    setTheCoins();
  }, []);

  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <ConversationAreasList />
      <Text fontSize='20px' color={dailyCoveyCoinMessageColor}>
        {dailyCoveyCoinMessage}
      </Text>
      <Text fontSize='20px' color={dailyCoveyCoinMessageColor}>
         \/\/\/\/\/\/\/\/\/\/\/\/\/
      </Text>
      <Button
        data-testid='getButton'
        onClick={handleGetData}>
        Gain Covey Coin!
      </Button>
      <Text fontSize='20px' color={dailyCoveyCoinMessageColor}>
      /\/\/\/\/\/\/\/\/\/\/\/\/\
      </Text>
    </VStack>
  );
}
/* <Flex>
     <Image src='/assets/atlas/hat-icons/coveycoin.png' objectFit='contain' width='30px' />
     <Text fontSize='20px'>
     : {playerCoveyCoin}
      </Text></Flex> */
