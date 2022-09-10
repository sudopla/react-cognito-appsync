import React, { useState, useRef } from 'react'
import { Auth } from 'aws-amplify'
import { S3Client } from '@aws-sdk/client-s3'
import { FiUpload } from 'react-icons/fi'
import {
  Stack,
  FormControl,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon
} from '@chakra-ui/react'
import { uploadFile } from './s3_functions'

interface NewFileProps {
  isOpen: boolean
  onClose: () => void
}

const NewFile = ({ isOpen, onClose }: NewFileProps) => {
  const [file, setFile] = useState<File>()
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [uploadFailed, setUploadFiled] = useState<string>('')
  const [uploadSucceeded, setUploadSucceeded] = useState<boolean>(false)

  const hiddenFileInputRef = useRef<HTMLInputElement>(null)

  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setUploadSucceeded(false)
    setUploadFiled('')
    if (file !== undefined) {
      Auth.currentCredentials()
        .then((credentials) => {
          // Configure S3 Client with AWS credentials
          const s3Client = new S3Client({
            region: process.env.REACT_APP_AWS_REGION,
            credentials: {
              accessKeyId: credentials.accessKeyId,
              secretAccessKey: credentials.secretAccessKey,
              sessionToken: credentials.sessionToken
            }
          })
          return uploadFile(s3Client, file)
        })
        .then(() => {
          console.log('uploaded successfully')
          setIsSaving(false)
          setFile(undefined)
          setUploadSucceeded(true)
        })
        .catch((error) => {
          console.log(error)
          setIsSaving(false)
          setUploadFiled('Failed to upload file')
        })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={submitHandler}>
          <ModalHeader>New File</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={2}>
              <FormControl id="file">
                <HStack justifyContent="left" spacing={2}>
                  {/* <FormLabel w="100px">File</FormLabel> */}
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiUpload} />
                    </InputLeftElement>
                    <Input
                      type="file"
                      ref={hiddenFileInputRef}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        event.currentTarget.files && setFile(event.currentTarget.files[0])
                      }
                      style={{ display: 'none' }}
                    />
                    <Input
                      isReadOnly
                      placeholder="Click to Upload"
                      _placeholder={{ opacity: 0.6 }}
                      borderColor="gray.300"
                      onClick={() =>
                        hiddenFileInputRef.current && hiddenFileInputRef.current.click()
                      }
                      _hover={{
                        _placeholder: { opacity: 1 },
                        borderColor: 'gray.400'
                      }}
                      value={file?.name}
                      style={{ cursor: 'pointer' }}
                    />
                  </InputGroup>
                </HStack>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter paddingTop={0}>
            <Stack spacing={4} direction="column" w="full">
              <HStack spacing={0} justifyContent="right">
                <Button type="submit" isLoading={isSaving} colorScheme="blue" mr={3}>
                  Upload
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </HStack>
              {uploadFailed && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{uploadFailed}</AlertDescription>
                </Alert>
              )}
              {uploadSucceeded && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertDescription>File was upload successfully</AlertDescription>
                </Alert>
              )}
            </Stack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default NewFile
