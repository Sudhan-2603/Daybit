use std::env;
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

fn is_port_listening(port: u16) -> bool {
    TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_millis(500),
    )
    .is_ok()
}

fn get_project_root() -> PathBuf {
    let mut exe_path = env::current_exe().unwrap_or_else(|_| PathBuf::from("."));
    exe_path.pop(); // remove Daybit.exe

    // If inside releases/v0.1/windows/, traverse up 3 levels
    let candidate = exe_path.join("../../../");
    if candidate.join("backend").exists() && candidate.join("frontend").exists() {
        return candidate.canonicalize().unwrap_or(candidate);
    }
    // Check if in root
    if exe_path.join("backend").exists() {
        return exe_path;
    }
    // Check parent
    let parent = exe_path.join("..");
    if parent.join("backend").exists() {
        return parent;
    }

    PathBuf::from(".")
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() > 1 {
        match args[1].as_str() {
            "-v" | "--version" => {
                println!("Daybit v0.1.0 (Stable Release) - Cross-Platform Task Manager");
                return;
            }
            "-h" | "--help" => {
                println!("Daybit v0.1.0 - Cross-Platform Task Manager & Productivity Workspace");
                println!("Usage: Daybit.exe [OPTIONS]");
                println!();
                println!("Options:");
                println!("  -v, --version    Show Daybit version");
                println!("  -h, --help       Show this help message");
                println!("  --browser-only   Open browser window without launching background services");
                return;
            }
            _ => {}
        }
    }

    println!("========================================================");
    println!("  Daybit v0.1.0 - Starting Application...");
    println!("========================================================");

    let root = get_project_root();

    // 1. Ensure backend is running
    if !is_port_listening(4000) {
        println!("[1/3] Starting Daybit Backend Server (port 4000)...");
        let backend_bin = root.join("backend/target/debug/daybit-backend.exe");
        if backend_bin.exists() {
            let _ = Command::new(&backend_bin)
                .current_dir(root.join("backend"))
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn();
        } else {
            let _ = Command::new("cargo")
                .args(["run"])
                .current_dir(root.join("backend"))
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn();
        }
        thread::sleep(Duration::from_millis(1500));
    } else {
        println!("[1/3] Daybit Backend Server is already active on port 4000.");
    }

    // 2. Ensure frontend is running
    if !is_port_listening(5173) {
        println!("[2/3] Starting Daybit Frontend Server (port 5173)...");
        let _ = Command::new("cmd")
            .args(["/c", "npm", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"])
            .current_dir(root.join("frontend"))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn();
        thread::sleep(Duration::from_millis(2000));
    } else {
        println!("[2/3] Daybit Frontend Server is already active on port 5173.");
    }

    // 3. Launch native desktop window
    println!("[3/3] Opening Daybit Workspace Window (http://localhost:5173)...");
    let edge_paths = [
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    ];

    let mut launched = false;
    for path in edge_paths {
        if PathBuf::from(path).exists() {
            if Command::new(path)
                .args(["--app=http://localhost:5173", "--window-size=1280,840"])
                .spawn()
                .is_ok()
            {
                launched = true;
                break;
            }
        }
    }

    if !launched {
        let _ = Command::new("cmd")
            .args(["/c", "start", "http://localhost:5173"])
            .spawn();
    }

    println!("Done! Daybit v0.1 is active.");
}
