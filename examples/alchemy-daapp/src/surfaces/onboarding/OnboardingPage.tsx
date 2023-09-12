import { SmartAccountSigner } from "@alchemy/aa-core";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  CircularProgressLabel,
  Code,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import { useAccount } from "wagmi";
import { useSimpleAccountSigner } from "~/clients/simpleAccountSigner";
import { LoadingScreen } from "~/surfaces/shared/LoadingScreen";
import { queryClient } from "../../clients/query";
import { useOnboardingOrchestrator } from "./OnboardingController";
import { OnboardingStepIdentifier } from "./OnboardingDataModels";

export function OnboardingPage() {
  const { isConnected } = useAccount();
  const ownerResult = useSimpleAccountSigner();
  if (isConnected && !ownerResult.isLoading) {
    return <Onboarding owner={ownerResult.owner} />;
  } else {
    return <LoadingScreen />;
  }
}

function UnmemoOnboarding({ owner }: { owner: SmartAccountSigner }) {
  const router = useRouter();
  const [gasManagerChecked, setGasManagerChecked] = useState(false);
  const { go, reset, currentStep } = useOnboardingOrchestrator(
    gasManagerChecked,
    owner
  );

  const memberOnboardingMutation = useMutation<
    void,
    {
      cause: {
        code: number;
        message: string;
      };
      metaMessages: string[];
    },
    void,
    unknown
  >(go, {
    onSuccess: () => {
      queryClient.invalidateQueries(["member", "me"]);
    },
  });

  return (
    <VStack
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      gap={5}
    >
      <Heading>Welcome!</Heading>
      <Heading size="sm" textAlign="center">
        Click below to get started.
        <br />
        If you have a gas manager policy configured you can check the box below.
      </Heading>
      <Button
        isLoading={memberOnboardingMutation.isLoading}
        onClick={() => {
          reset();
          memberOnboardingMutation.mutate();
        }}
      >
        Setup Your Wallet
      </Button>
      <Checkbox
        isChecked={gasManagerChecked}
        onChange={(e) => setGasManagerChecked(e.target.checked)}
      >
        Cover gas fees with your gas manager
      </Checkbox>
      <Modal
        isOpen={!memberOnboardingMutation.isIdle}
        onClose={() => {
          reset();
          memberOnboardingMutation.reset();
          if (currentStep.identifier === OnboardingStepIdentifier.DONE)
            router.reload();
        }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent
          display="flex"
          alignSelf="center"
          minW="750px"
          maxH="500px"
          h="50vh"
        >
          <ModalCloseButton />
          <ModalBody
            flex={1}
            display="flex"
            alignItems="center"
            paddingTop="25px"
            overflow="auto"
            gap="10px"
          >
            <VStack
              flex={1}
              padding="10px"
              borderRight="1px dashed lightgray"
              alignItems="start"
              justifyContent="center"
              h="100%"
            >
              <HStack gap={0}>
                <Box
                  transition="max-width 0.6s ease-in-out"
                  maxW={memberOnboardingMutation.isError ? "100%" : "0px"}
                  overflow="hidden"
                >
                  <Heading
                    color="red"
                    size="lg"
                    paddingRight="5px"
                    wordBreak="keep-all"
                    maxH="40px"
                  >
                    Failed:
                  </Heading>
                </Box>
                <Heading
                  color={memberOnboardingMutation.isError ? "red" : undefined}
                  size="lg"
                  transition="all 0.3s ease-in-out"
                  style={{ margin: 0 }}
                >
                  {currentStep.title}
                </Heading>
              </HStack>

              {typeof currentStep.description === "string" ? (
                <Heading size="sm" minH="40px" overflow="auto">
                  {currentStep.description}
                </Heading>
              ) : (
                currentStep.description
              )}
              <Box
                flex={memberOnboardingMutation.isError ? 1 : 0}
                transition="all 0.3s ease-in-out"
                overflow="auto"
              >
                <Code
                  color={memberOnboardingMutation.isError ? "red" : undefined}
                  background="#00000000"
                  wordBreak="break-word"
                  paddingRight="10px"
                >
                  {memberOnboardingMutation.error?.cause && (
                    <b>
                      {memberOnboardingMutation.error.cause.message} (
                      {memberOnboardingMutation.error.cause.code})
                    </b>
                  )}
                  {!memberOnboardingMutation.error?.cause && (
                    <b>{`${memberOnboardingMutation.error}`}</b>
                  )}
                  {memberOnboardingMutation.error?.metaMessages?.map((v, i) => (
                    <Box key={i}>{v}</Box>
                  ))}
                </Code>
              </Box>
            </VStack>
            <CircularProgress
              value={currentStep.percent}
              color={
                currentStep.percent === 100
                  ? "green.500"
                  : memberOnboardingMutation.isError
                  ? "red"
                  : "blue.500"
              }
              position="relative"
              size="100px"
            >
              <Spinner
                position="absolute"
                width="95px"
                height="95px"
                top="2px"
                left="2px"
                color="blue.300"
                thickness="10px"
                opacity={
                  currentStep.percent === 100 ||
                  memberOnboardingMutation.isError
                    ? 0
                    : 0.3
                }
                transition="opacity 0.3s ease-in-out"
              />

              <CircularProgressLabel>
                {currentStep.percent}%
              </CircularProgressLabel>
            </CircularProgress>
          </ModalBody>
          <ModalFooter>
            <HStack>
              {memberOnboardingMutation.isError && (
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    memberOnboardingMutation.mutate();
                  }}
                >
                  ⤴ Retry Step
                </Button>
              )}
              {currentStep.percent !== 100 && (
                <Button
                  colorScheme="red"
                  onClick={() => {
                    memberOnboardingMutation.reset();
                  }}
                >
                  Quit
                </Button>
              )}
              {currentStep.identifier === OnboardingStepIdentifier.DONE && (
                <Button
                  colorScheme="blue.500"
                  onClick={() => {
                    memberOnboardingMutation.reset();
                  }}
                >
                  Accept
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

const Onboarding = memo(UnmemoOnboarding);
