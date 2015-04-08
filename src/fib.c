#include <stdio.h>

int
main() {
    int i = 1, j = 0;
    while (i < 50) {
	printf("%d\n", j);
	i = i + j;
	j = i - j;
    }
}
