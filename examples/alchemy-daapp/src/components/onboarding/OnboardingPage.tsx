import {
  Button,
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
  Text,
  VStack,
} from "@chakra-ui/react";
import {useMutation} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {useOnboardingController} from "../../clients/onboarding";
import {queryClient} from "../../clients/query";

export function OnboardingPage() {
  const navigate = useNavigate();
  const {go, reset, currentStep} = useOnboardingController();

  const memberOnboardingMutation = useMutation(go, {
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
    >
      <h1>Welcome!</h1>
      <Text>Click below to get started</Text>
      <Button
        isLoading={memberOnboardingMutation.isLoading}
        onClick={() => {
          reset();
          memberOnboardingMutation.mutate();
        }}
      >
        Setup Your Wallet
      </Button>
      <Modal
        isOpen={!memberOnboardingMutation.isIdle}
        onClose={() => {
          if (currentStep.percent === 100) navigate(`/profile/me`);
          reset();
          memberOnboardingMutation.reset();
        }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent alignSelf="center">
          <ModalCloseButton />
          <ModalBody display="flex" alignItems="center" paddingTop="25px">
            <HStack>
              <VStack
                flex={1}
                padding="10px"
                borderRight="1px dashed lightgray"
                h="200px"
                alignItems="start"
                justifyContent="center"
              >
                <Heading
                  color={memberOnboardingMutation.isError ? "red" : undefined}
                  size="md"
                >
                  {memberOnboardingMutation.isError ? "Error: " : ""}
                  {currentStep.title}
                </Heading>
                <Text overflow="auto">{currentStep.description}</Text>
                <Code
                  maxH="150px"
                  color={memberOnboardingMutation.isError ? "red" : undefined}
                  overflow="auto"
                  background="#00000000"
                >
                  {`${memberOnboardingMutation.error ?? " "}`}
                </Code>
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
            </HStack>
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
              {currentStep.percent === 100 && (
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
