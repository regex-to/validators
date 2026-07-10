package main
import "regexp"
func main() {
    _, err := regexp.Compile("(?=.*[a-z])")
    if err != nil {
        panic(err)
    }
}
