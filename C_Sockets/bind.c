#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char **argv){
    struct addrinfo hints, *res, *p;
    int status;
    int socketfd;
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;
    if((status = getaddrinfo(NULL, "8080", &hints, &res)) != 0){
        fprintf(stderr, "gai error: %s\n", gai_strerror(status));
        exit(1);
    }
    for(p = res; p != NULL; p = p->ai_next){
        socketfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol);
        if(socketfd == -1) continue;
        if(bind(socketfd, p->ai_addr, p->ai_addrlen) == -1){
            close(socketfd);
            continue;
        }
        break;
    }
    if(p == NULL){
        fprintf(stderr, "failed to bind\n");
        exit(1);
    }
    printf("Socket bound successfully\n");
    freeaddrinfo(res);
    return 0;
}