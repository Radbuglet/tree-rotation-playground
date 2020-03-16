import {TreeNode} from "./treeNode";

type Vector2 = [number, number];
const log_2 = Math.log(2);  // The log of 2. For getting log_2(...).
export class Application {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly mouse_pos: Vector2 = [0, 0];
    private clicked_this_frame: boolean = false;
    private tree_root?: TreeNode;

    constructor() {
        // Setup canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.canvas.height = 500;
        this.canvas.style.border = "1px solid";

        // Setup events and context
        document.body.append(this.canvas);   // It's crucial we do this here or getBoundingClientRect() will give us bad info.
        this.ctx = this.canvas.getContext("2d")!;  // Most of everyone will have support for canvas nowadays so these checks would just be boilerplate for bigger project
        (document.getElementById("make_bad_tree") as HTMLButtonElement).addEventListener("click", this.buildBadTree.bind(this));
        (document.getElementById("add_new_node") as HTMLButtonElement).addEventListener("click", () => {
            this.badInsertIntoTree(Math.floor(Math.random() * 100));
        });
        (document.getElementById("validate_tree") as HTMLButtonElement).addEventListener("click", this.validateTree.bind(this));
        {
            const bounding_rect = this.canvas.getBoundingClientRect();
            this.canvas.addEventListener("mousemove", evt => {
                this.mouse_pos[0] = evt.clientX - bounding_rect.left;
                this.mouse_pos[1] = evt.clientY - bounding_rect.top;
            });
        }
        this.canvas.addEventListener("mousedown", evt => {
            this.clicked_this_frame = true;
            evt.preventDefault();  // To avoid selecting by double clicking
        });

        // Startup
        this.buildBadTree();
        this.tick();
    }

    tick() {
        const { canvas, ctx } = this;
        window.requestAnimationFrame(this.tick.bind(this));
        ctx.save();

        // Apply camera
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Render tree
        let hovered_node: TreeNode | null = null;
        const node_render_size = 15;
        const node_total_size = 40;
        const layer_counts = [0];
        let nodes_rendered = 0;

        function line(from_pos: Vector2, to_pos: Vector2) {
            ctx.beginPath();
            ctx.moveTo(from_pos[0], from_pos[1]);
            ctx.lineTo(to_pos[0], to_pos[1]);
            ctx.stroke();
        }

        function square(x: number) {
            return x * x;
        }

        function distSquared(a: Vector2, b: Vector2) {
            return square(a[0] - b[0]) + square(a[1] - b[1]);
        }

        const renderNode = (node: TreeNode, layer_index: number): Vector2 => {
            nodes_rendered++;

            // Draw this node
            const position: Vector2 = [
                layer_counts[layer_index] * node_total_size + 20,
                layer_index * node_total_size + 20
            ];
            ctx.beginPath();
            ctx.arc(position[0], position[1], node_render_size, 0, Math.PI * 2);

            if (distSquared(position, this.mouse_pos) < square(node_render_size)) {
                hovered_node = node;
                ctx.strokeStyle = "green";
            } else {
                ctx.strokeStyle = "black";
            }

            ctx.fillText(node.value.toString(), position[0], position[1]);
            ctx.stroke();
            layer_counts[layer_index]++;

            // Go down the tree and render the sub nodes
            if (layer_index + 1 >= layer_counts.length) layer_counts.push(0);  // We assume that we will have children nodes who might be on a new layer. Even if this isn't true, it's only one extra element.
            if (node.left) {
                const left_pos = renderNode(node.left, layer_index + 1);
                ctx.strokeStyle = "blue";
                line(position, left_pos);
            }
            if (node.right) {
                const right_pos = renderNode(node.right, layer_index + 1);
                ctx.strokeStyle = "red";
                line(position, right_pos);
            }

            return position;
        };

        renderNode(this.tree_root!, 0);  // this.tree_root should never be null after the first call to buildBadTree() (or if there's a race condition which should be possible because the JS event loop is sync).

        if (this.clicked_this_frame) {
            if (hovered_node != null && hovered_node != this.tree_root) {
                hovered_node!.rotate();  // For some reason, Typescript doesn't think we ever assign to the variable and treats the other types in the union as never.
                if (hovered_node!.parent == null) {  // If the node no longer has a parent, this means that the node is now the root.
                    this.tree_root = hovered_node;
                }
            }
            this.clicked_this_frame = false;
        }

        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(`Nodes: ${nodes_rendered}. Height: ${layer_counts.length - 1} Min: ${Math.ceil(Math.log(nodes_rendered) / log_2)}`, canvas.width - 2, 2);

        ctx.restore();
    }

    buildBadTree() {  // This method used the strategy to build binary trees in an unbalanced way as taught in class.
        this.tree_root = new TreeNode(50);
        for (let x = 0; x < 20; x++) {
            this.badInsertIntoTree(Math.floor(Math.random() * 100));
        }
    }

    badInsertIntoTree(data: number) {
        let my_node = this.tree_root!;  // This should never be null because this.tree_root is always set (except in the constructor).
        while (true) {
//          if (data == my_node.value) return;  // Ignore this insertion as the value is already in the tree.
            if (data < my_node.value) {
                if (my_node.left != null) {
                    my_node = my_node.left;
                } else {
                    my_node.left = new TreeNode(data);
                    return;
                }
            } else {
                if (my_node.right != null) {
                    my_node = my_node.right;
                } else {
                    my_node.right = new TreeNode(data);
                    return;
                }
            }
        }
    }

    validateTree() {  // Should always return true but you can never be too sure.
        function validateNode(node: TreeNode) {
            if (node.left) {
                if (node.left.value > node.value) throw `Node left of ${node.value} has an invalid value.`;
                validateNode(node.left);
            }
            if (node.right) {
                if (node.right.value < node.value) throw `Node right of ${node.value} has an invalid value.`;
                validateNode(node.right);
            }
        }

        try {
            validateNode(this.tree_root!);
            alert("This graph is a valid binary tree.");
        } catch (e) {
            alert(e);
        }
    }
}

new Application();