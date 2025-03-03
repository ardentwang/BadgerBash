import SignIn from "./signin";

const NavBar = () => {
    return (
        <div className="fixed flex w-full items-center justify-end mt-5">
            <div className="mr-5">
                <SignIn/>
            </div>
        </div>
    )
}

export default NavBar;