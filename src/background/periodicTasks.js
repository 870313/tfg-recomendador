import { SendContextTask, ListenRecommendationResultTask } from './task';
import { InteractionManager } from 'react-native';
/**
 * Initializes background tasks with a 1-minute interval.
 * Stops any previously registered tasks to avoid duplicates.
 */
let sendContextStarted = false;
let sendContextActive = false;
export const startContextSending = () => {
  if (sendContextStarted) {return;}
  sendContextStarted = true;
  sendContextActive = true;

  const send = async () => {
    if (!sendContextActive) {return;}

    console.log('Sending Context...');
    try {
      await SendContextTask();
    } catch (err) {
      console.error('Sending context error:', err);
    }

    setTimeout(send, 35000);
  };

  InteractionManager.runAfterInteractions(() => {
    setTimeout(send, 1000);
  });
};

export const stopContextSending = () => {
  pollingActive = false;
  pollingStarted = false;
};


let pollingStarted = false;
let pollingActive = false;
export const startRecommendationPolling = () => {
  if (pollingStarted) {return;}
  pollingStarted = true;
  pollingActive = true;

  const poll = async () => {
    if (!pollingActive) {return;}

    console.log('Polling recommendations...');
    try {
      await ListenRecommendationResultTask();
    } catch (err) {
      console.error('Polling error:', err);
    }

    setTimeout(poll, 40000);
  };

  InteractionManager.runAfterInteractions(() => {
    setTimeout(poll, 1000);
  });
};

export const stopRecommendationPolling = () => {
  pollingActive = false;
  pollingStarted = false;
};



